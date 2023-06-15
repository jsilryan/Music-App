from django.db import models
import string
import random

def generate_unique_code():
    length = 6

    while True:
        character = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        char_list = list(character)
        code = random.choices(char_list, k=length)
        code = "".join(code) 
        if Room.objects.filter(code= code).count() == 0:
            break
    return code

        #''.join(random.choices(string.ascii_uppercase, k = length))

# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length = 8, default = "", unique = True)
    host = models.CharField(max_length = 50, unique = True) #! host has 1 room
    guest_can_pause = models.BooleanField(null = False, default = False)
    votes_to_skip = models.IntegerField(null = False, default = 1)
    created_at = models.DateTimeField(auto_now_add = True)
