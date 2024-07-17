from django.shortcuts import render
from tethys_sdk.routing import controller

@controller(url='/report')
def report(request):
    context = {}

    return render(request, 'wqm/pages/report.html', context)