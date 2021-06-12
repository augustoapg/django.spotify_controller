# React + Django Spotify Controller

Site that allows users to control songs in Spotify in a common room. The room can be created to allow guests to skip songs depending on an amount of votes.

The Frontend uses React and the Backend uses Django.

This was created from a Tech With Tim tutorial: [Tech With Tim Tutorial](https://www.youtube.com/playlist?list=PLzMcBGfZo4-kCLWnGmK0jUBmGLaJxvi4j)

# Setup
Install dependencies:
```
pip install django djangorestframework
```

## Web Server:
To start the web server:
```
cd music_controller
python manage.py runserver
```

## Front-end
To install the front-end's dependencies and compile the front-end:
```
cd music_controller/frontend
npm i
npm run dev
```

To build for production, replace `npm run dev` for `npm run build`


