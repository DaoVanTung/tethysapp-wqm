from django.shortcuts import render
from tethys_sdk.routing import controller

@controller(url='/administration')
def administration(request):
    context = {}

    return render(request, 'wqm/pages/administration.html', context)