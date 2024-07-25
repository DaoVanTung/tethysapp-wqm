from django.http import JsonResponse
from django.shortcuts import render
from tethys_sdk.routing import controller

@controller(url='/settings')
def administration(request):
    context = {}

    return render(request, 'wqm/pages/settings.html', context)