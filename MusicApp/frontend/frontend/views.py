from django.shortcuts import render

# Create your views here.
def front(request, *args, **kwargs):
    # context = { }
    #return render(request, 'index.html', context)
    return render(request, 'index.html')