from django.urls import path
from .views import index

# giving the app_name, and adding the name to the root path enables the redirect in Spotify view
app_name = "frontend"

urlpatterns = [
    path("", index, name=""),
    path("join", index),
    path("create", index),
    path("room/<str:roomCode>", index),
    path("info", index),
]
