# Johan Bjerke, Splunk Inc
# Python 3
import sys
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
def add_to_sys_path(paths, prepend=False):
    for path in paths:
        if prepend:
            if path in sys.path:
                sys.path.remove(path)
            sys.path.insert(0, path)
        elif not path in sys.path:
            sys.path.append(path)

def add_python_version_specific_paths():
    '''
        Adds extra paths for libraries specific to Python2 or Python3,
        determined at a runtime
    '''
    # We should not rely on core enterprise packages:
    if sys.version_info >= (3, 0):
        add_to_sys_path([make_splunkhome_path(['etc', 'apps', 'SplunkAppForWebAnalytics', 'lib', 'py3'])], prepend=True)
    else:
        add_to_sys_path([make_splunkhome_path(['etc', 'apps', 'SplunkAppForWebAnalytics', 'lib', 'py2'])], prepend=True)
    # Common libraries like future
    add_to_sys_path([make_splunkhome_path(['etc', 'apps', 'SplunkAppForWebAnalytics', 'lib', 'py23'])], prepend=True)
    from six.moves import reload_module
    try:
        if 'future' in sys.modules:
            import future
            reload_module(future)
    except Exception:
        '''noop: future was not loaded yet'''
add_to_sys_path([make_splunkhome_path(['etc', 'apps', 'SplunkAppForWebAnalytics', 'lib', 'py23', 'splunklib'])], prepend=True)
add_python_version_specific_paths()

import urllib
import csv,re,os,numbers,itertools,logging
from ua_parser import user_agent_parser

# The following log levels are available:
# Debug (NOISY!!!):
# LOG_LEVEL = logging.DEBUG
# Info:
# LOG_LEVEL = logging.INFO
# Error:
LOG_LEVEL = logging.ERROR
SPLUNK_HOME = os.environ.get("SPLUNK_HOME")
LOG_FILENAME = SPLUNK_HOME+'/var/log/splunk/TA-user_agents.log'
LOG_FORMAT = "[%(asctime)s] %(name)s %(levelname)s: %(message)s"
logging.basicConfig(filename=LOG_FILENAME,level=LOG_LEVEL,format=LOG_FORMAT)
logger = logging.getLogger('user_agents')

#
# Main routine - basically it's the standard python recipe for handling
# Splunk lookups
#
if __name__ == '__main__':
    r = csv.reader(sys.stdin)
    w = csv.writer(sys.stdout)
    have_header = False
    
    header = []
    idx = -1
    for row in r:
        if (have_header == False):
            header = row
            logger.debug('fields found: %s' % header)
            have_header = True
            z = 0
            for h in row:
                if (h == "http_user_agent"):
                    idx = z
                z = z + 1
            w.writerow(row)
            continue
        
        # We only care about the cs_user_agent field - everything else is filled in
        http_user_agent = row[idx]
        useragent = urllib.parse.unquote_plus(http_user_agent)
        logger.debug('found useragent %s' % http_user_agent)
        
        logger.debug('sending to ua-parser')
        results = []
        try:
	        results = user_agent_parser.Parse(http_user_agent)
        except Exception as err:
            logger.error(err)
            continue
        logger.debug('back from ua-parser')

        # create our results for Splunk
        # using the full results
        forSplunk = {
                     'ua_os_family':'unknown',
                     'ua_os_major':'unknown',
                     'ua_os_minor':'unknown',
                     'ua_os_patch':'unknown',
                     'ua_os_patch_minor':'unknown',
                     'ua_family':'unknown',
                     'ua_major':'unknown',
                     'ua_minor':'unknown',
                     'ua_patch':'unknown',
                     'ua_device':'unknown'
                    }

        # UA
        if results['user_agent']['family'] is not None:
            if results['user_agent']['family'] != 'Other':
                forSplunk['ua_family'] = results['user_agent']['family']
        if results['user_agent']['major'] is not None:
            forSplunk['ua_major'] = results['user_agent']['major']
        if results['user_agent']['minor'] is not None:
            forSplunk['ua_minor'] = results['user_agent']['minor']
        if results['user_agent']['patch'] is not None:
            forSplunk['ua_patch'] = results['user_agent']['patch']
        # Device
        if results['device']['family'] is not None:
            if results['device']['family'] != 'Other':
                forSplunk['ua_device'] = results['device']['family']
        # OS
        if results['os']['family'] is not None:
            if results['os']['family'] != 'Other':
	            forSplunk['ua_os_family'] = results['os']['family']
        if results['os']['major'] is not None:
            forSplunk['ua_os_major'] = results['os']['major']
        if results['os']['minor'] is not None:
            forSplunk['ua_os_minor'] = results['os']['minor']
        if results['os']['patch'] is not None:
            forSplunk['ua_os_patch'] = results['os']['patch']
        if results['os']['patch_minor'] is not None:
            forSplunk['ua_os_patch_minor'] = results['os']['patch_minor']

        logger.debug('for return: %s' % forSplunk)
        # Now write it out
        logger.debug('outputting')
        orow = []
        for header_name in header:
            if (header_name == "http_user_agent"):
                orow.append(http_user_agent)
            else:
                orow.append(forSplunk[header_name])
        w.writerow(orow)
        logger.debug('done output')
            

