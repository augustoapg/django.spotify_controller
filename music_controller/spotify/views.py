from spotify.models import Vote
from api.models import Room
from django.shortcuts import render, redirect
from rest_framework.response import Response
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from .util import (
    execute_spotify_api_request,
    is_spotify_authenticated,
    update_or_create_user_tokens,
    play_song,
    pause_song,
    skip_song,
)


class AuthURL(APIView):
    """
    creates the url to authorize Spotify, which will be used by the frontend
    """

    def get(self, request, format=None):
        scope = "user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played"

        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scope,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    """
    get the tokens from Spotify and store them in DB
    """
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token
    )

    # redirect to the frontend application, in the home page
    return redirect("frontend:")


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response(
                {"message": "Error getting room code"}, status=status.HTTP_404_NOT_FOUND
            )
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "item" not in response:
            # return self.get_last_played_song(room, host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")
        votes = Vote.objects.filter(room=room, song_id=room.current_song)

        artists = item.get("artists")
        artist_string = self.get_artists_string(artists)

        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "time": progress,
            "image_url": album_cover,
            "is_playing": is_playing,
            "votes": len(votes),
            "votes_required": room.votes_to_skip,
            "id": song_id,
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)

    def get_artists_string(self, artists):
        artist_string = ""
        for i, artist in enumerate(artists):
            if i > 0:
                artist_string += ", "
            name = artist.get("name")
            artist_string += name
        return artist_string

    def get_last_played_song(self, room, host):
        # attempted to get last played song to show in case user had not played a song in a while,
        # and currently-playing returns nothing. This function works, but user won't be able to
        # play the shown song for not having an active device set. TODO: Get endpoint for
        # allowing the user to choose a device to play
        print("last-played")
        endpoint = "player/recently-played"
        response = execute_spotify_api_request(host, endpoint)

        if (
            "error" in response
            or "items" not in response
            or len(response.get("items")) == 0
        ):
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("items")[0]

        title = item.get("track").get("name")
        duration = item.get("track").get("duration_ms")
        album_cover = item.get("track").get("album").get("images")[0].get("url")
        song_id = item.get("track").get("id")
        artists = item.get("track").get("artists")
        artist_string = self.get_artists_string(artists)

        song = {
            "title": title,
            "artist": artist_string,
            "duration": duration,
            "time": 0,
            "image_url": album_cover,
            "is_playing": False,
            "votes": 0,
            "votes_required": room.votes_to_skip,
            "id": song_id,
        }

        print(song)

        self.update_room_song(room, song_id)
        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])

            # delete votes that were given to previous song
            Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    def put(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        room_code = self.request.session.get("room_code")
        rooms = Room.objects.filter(code=room_code)

        if len(rooms):
            room = rooms[0]
        else:
            return Response(
                {"message": "Room does not exist"}, status=status.HTTP_404_NOT_FOUND
            )

        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)


class PlaySong(APIView):
    def put(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        room_code = self.request.session.get("room_code")
        rooms = Room.objects.filter(code=room_code)

        if len(rooms):
            room = rooms[0]
        else:
            return Response(
                {"message": "Room does not exist"}, status=status.HTTP_404_NOT_FOUND
            )

        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        room_code = self.request.session.get("room_code")
        rooms = Room.objects.filter(code=room_code)

        if len(rooms):
            room = rooms[0]
        else:
            return Response(
                {"message": "Room does not exist"}, status=status.HTTP_404_NOT_FOUND
            )

        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_from_this_user = Vote.objects.filter(
            room=room, song_id=room.current_song, user=self.request.session.session_key
        )
        votes_needed = room.votes_to_skip
        is_user_host = self.request.session.session_key == room.host

        if not is_user_host and len(votes_from_this_user) >= 1:
            return Response(
                {"message": "This user has already voted to skip this song"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            self.request.session.session_key == room.host
            or len(votes) + 1 >= votes_needed
        ):
            skip_song(room.host)
            votes.delete()
        else:
            vote = Vote(
                user=self.request.session.session_key,
                room=room,
                song_id=room.current_song,
            )
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)
