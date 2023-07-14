from django.shortcuts import render
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import update_or_create_user_tokens, is_spotify_authenticated
from django.http import HttpResponseRedirect

authKey = None

class AuthURL(APIView):
    def get(self, request, format = None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        
        url = Request('GET', 'https://accounts.spotify.com/authorize', params = {
            'scope' : scopes,
            'response_type' : 'code',
            "redirect_uri" : REDIRECT_URI,
            'client_id' : CLIENT_ID
        }).prepare().url
        #Return a url to  authenticate the spotify api

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

    response = post('https://accounts.spotify.com/api/token', data = {
        'grant_type' : 'authorization_code',
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
    print(access_token, token_type, refresh_token, expires_in)

    if not request.session.exists(authKey):
        request.session.create()

    update_or_create_user_tokens(
        authKey,
        access_token, 
        token_type,
        expires_in,
        refresh_token
    )

    redirect_url = "http://localhost:3000"  # Replace with your React page URL

    return HttpResponseRedirect(redirect_url)
    
    # redirect_url = "http://localhost:3000"  # Replace with your React page URL

    # response = {
    #     "redirect_url": redirect_url
    # }

    # return JsonResponse(response)

class IsAuthenticated(APIView):
    kwarg2 = 'key'
    def get(self, request, format = None):
        key = request.GET.get(self.kwarg2)
        global authKey
        authKey = key
        print("Auth Key: ", authKey)
        if key:
            if not self.request.session.exists(key):
                self.request.session.create()
                key = self.request.session.session_key
            else:
                self.request.session.create()
                key = self.request.session.session_key 
        isAuthenticated = is_spotify_authenticated(key)
        print(isAuthenticated)
        return Response({'status' : isAuthenticated}, status = status.HTTP_200_OK)