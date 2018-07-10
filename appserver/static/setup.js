require([
    'splunkjs/ready!',
    'splunkjs/mvc/simplexml/ready!',
    'underscore',
    'splunkjs/mvc/multidropdownview'
], function(mvc, ignored, _, KVStore, MultiDropdownView) {
    // TODO: Add error handling for I/O errors.
    //       No time to fix now since feature freeze in a few hours...
    
    var VIOLATION_TYPE_ROW_TEMPLATE =
        _.template(
            "<div class='violation_type'>"+
                "<span class='name'><strong>Name:</strong> <input type=\"text\" disabled/></span> " +
                "<span class='color'><strong>Color:</strong> <input type=\"text\"/ disabled></span> " +
                "<span class='weight'><strong>Weight:</strong> <input type=\"text\"/></span>" +
            "</div>");
    
    var DEFAULT_VIOLATION_TYPES = [
        {
            id: 'Invalid_Time_Access',
            title: 'Off-Hours Access',
            color: 'Yellow',
            weight: 1.2
        },
        {
            id: 'Terminated_Access',
            title: 'Terminated Employee Access',
            color: 'Red',
            weight: 3.0
        },
        {
            id: 'Excessive_Access',
            title: 'Users with Excessive Accesses',
            color: 'Yellow',
            weight: 1.0
        }
    ];
    
    
    
    var oldSetupModelId;

    // Using Splunk JS SDK, perform a runtime check of the eventgen utility installation and
    // provide a corresponding to the user.
    // Implementation alternative: add a button/checkbox to the Setup UI to enable/disable
    // the eventgen app or the eventgen modular input. This approach is more involved and requires issuing a REST API call.
    var service = mvc.createService();
    service.apps()
        .fetch(function(err, apps) {
            if (err) {
                console.error(err);
                return;
            }

            var TA-user-agentsApp = apps.item('TA-user-agents')
            if (TA-user-agentsApp) {
                TA-user-agentsApp.fetch(function(err, TA-user-agentsApp) {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    $('#TA-user-agents-loading').addClass('hide');

                    if (TA-user-agentsApp.state().content.disabled) {
                        $('#TA-user-agents-disabled').removeClass('hide');
                    } else if (!TA-user-agentsApp.state().content.disabled) {
                        $('#TA-user-agents-success').removeClass('hide');
                    } 
                });
            } else {
                $('#TA-user-agents-loading').addClass('hide');
                $('#TA-user-agents-notinstalled').removeClass('hide');
            }
        });
});