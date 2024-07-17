from tethys_sdk.base import TethysAppBase
from tethys_sdk.app_settings import PersistentStoreDatabaseSetting


class Wqm(TethysAppBase):
    """
    Tethys app class for Wqm.
    """

    name = 'Giải pháp giám sát ô nhiễm nguồn nước'
    description = ''
    package = 'wqm'  # WARNING: Do not change this value
    index = 'home'
    icon = f'{package}/images/icon.gif'
    root_url = 'wqm'
    color = '#27ae60'
    tags = ''
    enable_feedback = False
    feedback_emails = []
