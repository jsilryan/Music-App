from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from importlib import import_module
from django.conf import settings
from django.contrib.sessions.backends.db import SessionStore

# Create your views here. -> API View -> Helps not only view all the rooms but also create
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class CreateRoomView(APIView):
    #APIView helps override default methods: define get, put, post etc
    serializer_class = CreateRoomSerializer

    #Session info is stored in memory. If you leave, the session is gone
    def post(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            host = self.request.session.session_key
            queryset = Room.objects.filter(host = host)
            if queryset.exists():
                #update the room
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                self.request.session['room_code'] = room.code
                room.save(update_fields = ['guest_can_pause', 'votes_to_skip'])
            else:
                room = Room (
                    host = host, 
                    guest_can_pause = guest_can_pause, 
                    votes_to_skip = votes_to_skip
                    )
                room.save()
                self.request.session['room_code'] = room.code
                response = {
                    "message" : "Room has been saved",
                    "data" : RoomSerializer(room).data
                }
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code' #Need to pass a parameter in the url called code, and the code is equal to the room I want to get
    kwarg2 = 'key'

    def get (self, request, format = None):
        code = request.GET.get(self.lookup_url_kwarg) #Gets information of the URL from the GET request -> .get is to look for parameters in the url with Lookup_url_kwarg
        key = request.GET.get(self.kwarg2)
        if code != None:
            room = Room.objects.filter(code = code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                if key != None:
                    if key == room[0].host:
                        data['is_host'] = True
                        return Response(data, status = status.HTTP_200_OK)
                    else:
                        data['is_host'] = False
                        return Response(data, status = status.HTTP_200_OK)
                else:
                    data['is_host'] = False
                    return Response(data, status = status.HTTP_200_OK)

            return Response({'Room Not Found' : 'Invalid Room Code.'}, status = status.HTTP_404_NOT_FOUND)

        return Response ({'Bad Request' : 'Code Parameter not found in request'}, status = status.HTTP_400_BAD_REQUEST)

class JoinRoom(APIView):
    lookup_url_kwarg = 'code'
    kwarg2 = 'key'
    def post(self, request, format = None): 
        key = request.data.get(self.kwarg2)
        # print(key)
        if key:
            if not self.request.session.exists(key):
                self.request.session.create()
                key = self.request.session.session_key
        else:
            self.request.session.create()
            key = self.request.session.session_key

        print(key)

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                # engine = import_module(settings.SESSION_ENGINE)
                request.session = SessionStore(key)
                self.request.session['room_code'] = code #Temporary storage caled room_code
                request.session.save()
                print(request.session.get('room_code'))
                if key is not None:  # Check if key is set correctly
                    return Response({'key': key}, status=status.HTTP_200_OK)
                else:
                    return Response({'Bad Request': 'Failed to generate session key'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'Bad Request' : 'Invalid Room Code'}, status = status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request' : 'Invalid post data, did not find code key'}, status = status.HTTP_400_BAD_REQUEST)
                
class UserInRoom(APIView):
    kwarg2 = 'key'
    lookup_url_kwarg = 'code'
    def get(self, request, format = None):
        key = request.GET.get(self.kwarg2)
        code = request.GET.get(self.lookup_url_kwarg)
        if key:
            if not self.request.session.exists(key):
                self.request.session.create()
                key = self.request.session.session_key
        else:
            self.request.session.create()
            key = self.request.session.session_key 
        print(key)
        engine = import_module(settings.SESSION_ENGINE)
        request.session = engine.SessionStore(session_key = key)
        print(request.session.get('room_code'))
        if code:
            data = {
                'code' : code
            }
        else:
            data = {
                'code' : self.request.session.get('room_code')
            }

        return JsonResponse(data, status = status.HTTP_200_OK) #Takes a python dictionary and serialize it with a json serializer and sends it to the client side
        
class LeaveRoom(APIView):
    kwarg2 = 'key'
    #Post requests require a requestOptions from frontend
    def post(self, request, format = None):
        key = request.data.get(self.kwarg2)
        engine = import_module(settings.SESSION_ENGINE)
        request.session = engine.SessionStore(key)
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            #If the host of the room leaves, everyone else in the room leaves
            room_results = Room.objects.filter(host = host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({"Message" : "Deleted"}, status = status.HTTP_200_OK)

class UpdateRoom(APIView):
    #To update we use patch
    serializer_class = UpdateRoomSerializer
    kwarg2 = 'key'
    def patch(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data = request.data)

        key = request.GET.get(self.kwarg2)
        print(key)
        if key:
            if not self.request.session.exists(key):
                self.request.session.create()
                key = self.request.session.session_key
                
        else:
            self.request.session.create()
            key = self.request.session.session_key
             
        engine = import_module(settings.SESSION_ENGINE)
        request.session = engine.SessionStore(key)

        print(serializer)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code = code)

            if not queryset.exists(): #Also len > 0
                return Response({"Message" : "Room doesn't exist."}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            print(room.host)
            
            if room.host != key:
                return Response({"Message" : "You are not the host of this room."}, status= status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields = ['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status = status.HTTP_200_OK)

        return Response({'Bad Request' : "Invalid Data..."}, status = status.HTTP_400_BAD_REQUEST)