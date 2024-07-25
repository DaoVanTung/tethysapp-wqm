from django.shortcuts import render
from tethys_sdk.routing import controller

@controller
def home(request):
    context = {
    }

    return render(request, 'wqm/pages/dashboard.html', context)