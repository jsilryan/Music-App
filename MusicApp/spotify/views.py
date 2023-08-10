from django.shortcuts import render
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from django.http import HttpResponseRedirect
from backend.models import Room
from importlib import import_module
from django.conf import settings
from django.contrib.sessions.backends.db import SessionStore

class AuthURL(APIView):
    def get(self, request, format = None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        
        url = Request('GET', 'https://accounts.spotify.com/authorize', params = {
            'scope' : scopes,
            'response_type' : 'code', #Get a code back that authenticates the user
            "redirect_uri" : REDIRECT_URI,
            'client_id' : CLIENT_ID
        }).prepare().url
        #Return a url to authenticate the spotify api

        return Response({'url' : url}, status = status.HTTP_200_OK)

def spotify_callback(request, format = None):
    # kwarg2 = 'key'
    # key = request.GET.get(self.kwarg2)
    # if key:
    #     if not self.request.session.exists(key):
    #         self.request.session.create()
    #         key = self.request.session.session_key
    #     else:
    #         self.request.session.create()
    #         key = self.request.session.session_key 

    code = request.GET.get('code')
    error = request.GET.get('error')

    # Actually sending the URL different from in AuthURL view 
    response = post('https://accounts.spotify.com/api/token', data = {
        'grant_type' : 'authorization_code', #What we should get
        'code' : code,
        "redirect_uri" : REDIRECT_URI,
        'client_id' : CLIENT_ID,
        'client_secret' : CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')
    print(f"Access Token: {access_token}")
    print(f"Token Type: {token_type}")
    print(f"Refresh Token: {refresh_token}")

    authKey = request.session.session_key
    if not request.session.exists(authKey):
        request.session.create()
        authKey = request.session.session_key

    print(f"AuthKey: {authKey}")
    print(f"Expires In: {expires_in}")

    update_or_create_user_tokens(
        authKey,
        access_token, 
        token_type,
        expires_in,
        refresh_token
    )

    redirect_url = f"http://localhost:3000?authKey={authKey}"  # Replace with your React page URL

    return HttpResponseRedirect(redirect_url)

    # return redirect('frontend:') -> 
    # Go to frontend urls.py -> 
    # 1. Add -> app_name = "frontend"
    # 2. urlpatterns = [
    #   path('', index, name = "") -> The name of the path so that the redirect knows what path to go to
    # ]
    
    # redirect_url = "http://localhost:3000"  # Replace with your React page URL

    # response = {
    #     "redirect_url": redirect_url
    # }

    # return JsonResponse(response)

class IsAuthenticated(APIView):
    kwarg2 = 'key'
    def get(self, request, format = None):
        key = request.GET.get(self.kwarg2)
        # global authKey
        # authKey = key
        # print("Auth Key: ", authKey)
        if key != None:
            if not self.request.session.exists(key):
                self.request.session.create()
                key = self.request.session.session_key
        else:
            self.request.session.create()
            key = self.request.session.session_key 

        isAuthenticated = is_spotify_authenticated(key)
        print(isAuthenticated)
        return Response({'status' : isAuthenticated}, status = status.HTTP_200_OK)

class CurrentSong(APIView):
    kwarg2 = 'key'
    def get(self, request, format=None):
        key = request.GET.get(self.kwarg2)
        print(f"Key : {key}")

        endpoint = 'player/currently-playing'
        response = execute_spotify_api_request(key, endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({}, status = status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        song = {
            'title' : item.get('name'),
            'artist' : artist_string,
            'duration' : duration,
            'time' : progress,
            'image_url' : album_cover,
            'is_playing' : is_playing,
            'votes' : 0,
            'id' : song_id
        }

        return Response(song, status=status.HTTP_200_OK)

class PauseSong(APIView):
    kwarg = 'key'
    kwarg2 = 'authKey'
    def put(self, request, format=None):
        key = request.GET.get(self.kwarg)
        authKey = request.GET.get(self.kwarg2)
        print(f"Key: {key}")
        print(f"Auth Key: {authKey}")
        engine = import_module(settings.SESSION_ENGINE)
        request.session = engine.SessionStore(session_key = key)
        print(f"Room Code: {request.session.get('room_code')}")
        new_code = self.request.session.get('room_code')
        if new_code:
            room = Room.objects.filter(code = new_code)[0]
            if key == room.host or room.guest_can_pause:
                pause_song(authKey)
                return Response({}, status=status.HTTP_204_NO_CONTENT)

            return Response({}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    kwarg = 'key'
    kwarg2 = 'authKey'
    def put(self, request, format=None):
        key = request.GET.get(self.kwarg)
        authKey = request.GET.get(self.kwarg2)
        print(f"Key: {key}")
        print(f"Auth Key: {authKey}")
        engine = import_module(settings.SESSION_ENGINE)
        request.session = engine.SessionStore(session_key = key)
        print(f"Room Code: {request.session.get('room_code')}")
        new_code = self.request.session.get('room_code')
        if new_code:
            room = Room.objects.filter(code = new_code)[0]
            if key == room.host or room.guest_can_pause:
                play_song(authKey)
                return Response({}, status=status.HTTP_204_NO_CONTENT)

            return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
    kwarg = 'key'
    kwarg2 = 'authKey'
    def post(self, request, format=None):
        key = request.GET.get(self.kwarg)
        authKey = request.GET.get(self.kwarg2)
        print(f"Key: {key}")
        print(f"Auth Key: {authKey}")
        engine = import_module(settings.SESSION_ENGINE)
        request.session = engine.SessionStore(session_key = key)
        print(f"Room Code: {request.session.get('room_code')}")
        new_code = self.request.session.get('room_code')
        if new_code:
            room = Room.objects.filter(code = new_code)
            print (room)
            if room:
                if key == room[0].host:
                    skip_song(authKey)
                else:
                    pass

                return Response({}, status.HTTP_204_NO_CONTENT)