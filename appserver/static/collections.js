$("#addButton").css("display", "inline").html($("<button class=\"btn btn-primary\">Save config</button>").click(function() {
    postNewEntry();
}))
$("#deleteButton").css("display", "inline").html($("<button class=\"btn btn-primary errorColor\">Delete config</button>").click(function() {
    deleteEntry()
}));
$("#deleteButton button").css("background-color", "#dc4e41");
$("#clearButton").css("display", "inline").html($("<button class=\"btn btn-primary\">Clear form</button>").click(function() {
    clearForm();
}));

function postNewEntry() {
    var key=$("#setup_key input").val()
    if (key=="") {
      var record = {
          value: $("#setup_value input").val(),
          host: $("#setup_host input").val(),
          source: $("#setup_source input").val()
      }
      console.log("Sending new data to KVStore", record);
      $.ajax({
          url: '/en-US/splunkd/__raw/servicesNS/nobody/SplunkAppForWebAnalytics/storage/collections/data/WA_settings',
          type: 'POST',
          contentType: "application/json",
          async: false,
          data: JSON.stringify(record),
          success: function(returneddata) { newkey = returneddata;console.log("Added!", returneddata) }
      })
      setTimeout(function(){splunkjs.mvc.Components.getInstance("settings_search").startSearch();}, 500)
      setTimeout(function(){splunkjs.mvc.Components.getInstance("available_search").startSearch();}, 500)
    } else {
      var record = {
        _key: key,
        value: $("#setup_value input").val(),
        host: $("#setup_host input").val(),
        source: $("#setup_source input").val()
      }
      console.log("Updating entry in KVStore", record);
      updateExistingRecord(record, "WA_settings", key)
      setTimeout(function(){splunkjs.mvc.Components.getInstance("settings_search").startSearch();}, 500)
      setTimeout(function(){splunkjs.mvc.Components.getInstance("available_search").startSearch();}, 500)
    }

}
function updateExistingRecord(record, collection, key) {

    $.ajax({
        url: '/en-US/splunkd/__raw/servicesNS/nobody/SplunkAppForWebAnalytics/storage/collections/data/' + collection + '/' + key,
        type: "POST",
        async: true,
        contentType: "application/json",
        data: JSON.stringify(record),
        success: function(returneddata) {
            console.log("Updated!", returneddata)
        },
        error: function(xhr, textStatus, error) {
            console.error("Error Updating!", xhr, textStatus, error);
            $.ajax({
                url: '/en-US/splunkd/__raw/servicesNS/nobody/SplunkAppForWebAnalytics/storage/collections/data/' + collection,
                type: "POST",
                async: true,
                contentType: "application/json",
                data: JSON.stringify(record),
                success: function(returneddata) {
                    console.log("Added!", returneddata)
                },
                error: function(xhr, textStatus, error) {
                    console.error("Error Adding!", xhr, textStatus, error);
                }
            });
        }
    });
}
function deleteEntry() {
  var key=$("#setup_key input").val()
  if (key!="") {
    deleteExistingRecord("WA_settings", key)
    setTimeout(function(){splunkjs.mvc.Components.getInstance("settings_search").startSearch();}, 500)
    setTimeout(function(){splunkjs.mvc.Components.getInstance("available_search").startSearch();}, 500)
  }
}
function deleteExistingRecord(collection, key) {
    $.ajax({
        url: '/en-US/splunkd/__raw/servicesNS/nobody/SplunkAppForWebAnalytics/storage/collections/data/' + collection + '/' + key,
        type: "DELETE",
        async: true,
        success: function(returneddata) {
            console.log("Deleted!", returneddata)
        },
        error: function(xhr, textStatus, error) {
            console.error("Error deleting!", xhr, textStatus, error);
            $.ajax({
                url: '/en-US/splunkd/__raw/servicesNS/nobody/SplunkAppForWebAnalytics/storage/collections/data/' + collection,
                type: "DELETE",
                async: true,
                success: function(returneddata) {
                    console.log("Deleted!", returneddata)
                },
                error: function(xhr, textStatus, error) {
                    console.error("Error deleting!", xhr, textStatus, error);
                }
            });
        }
    });
}
function clearForm() {
    var submittedTokens = splunkjs.mvc.Components.getInstance("submitted");
    var unsubmittedTokens = splunkjs.mvc.Components.getInstance("default");
    submittedTokens.unset("form.key");
    submittedTokens.unset("form.value");
    submittedTokens.unset("form.host");
    submittedTokens.unset("form.source");
    unsubmittedTokens.unset("form.key");
    unsubmittedTokens.unset("form.value");
    unsubmittedTokens.unset("form.host");
    unsubmittedTokens.unset("form.source");
    $("#setup_key input").val('');
    $("#setup_key input").attr("value","");
    $("#setup_key div[data-test-value]").attr( "data-test-value", "" );
    $("#setup_value input").val('');
    $("#setup_value input").attr("value","");
    $("#setup_value div[data-test-value]").attr( "data-test-value", "" );
    $("#setup_host input").val('');
    $("#setup_host input").attr("value","");
    $("#setup_host div[data-test-value]").attr( "data-test-value", "" );
    $("#setup_source input").val('');
    $("#setup_source input").attr("value","");
    $("#setup_source div[data-test-value]").attr( "data-test-value", "" );
}
function migrateConfig() {
    var unsubmittedTokens = splunkjs.mvc.Components.getInstance("default")
    var submittedTokens = splunkjs.mvc.Components.getInstance("submitted")
    unsubmittedTokens.set("migrationStatus", "migrated")
    submittedTokens.set(unsubmittedTokens.toJSON())
    var desiredSearchName = "migrationSearch"
    if (typeof splunkjs.mvc.Components.getInstance(desiredSearchName) == "object") {
        var sm=splunkjs.mvc.Components.getInstance(desiredSearchName);
        sm.startSearch();
        console.log("Migrate job started")
    }
    console.log("Migrating config")
}
require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function() {
    /* This adds inline icons on the documentation and sites setup page */
    $("#setup_key input").prop("readonly", true);
});

// This is the javascript that does the migration from the old lookup to the new one, post v2.1
$("#migrateButton").css("display", "inline").html($("<button class=\"btn btn-primary errorColor\">Migrate old config</button>").click(function() {
    migrateConfig();
}))

require(['jquery',
    "splunkjs/mvc/utils",
    "splunkjs/mvc/searchmanager"
], function($,
    utils,
    SearchManager) {
    var desiredSearchName = "migrationSearch"
    if (typeof splunkjs.mvc.Components.getInstance(desiredSearchName) == "object") {
        // console.log(desiredSearchName, "already exists. This probably means you're copy-pasting the same code repeatedly, and so we will clear out the old object for convenience")
        splunkjs.mvc.Components.revokeInstance(desiredSearchName)
    }
    var sm = new SearchManager({
        "id": desiredSearchName,
        "cancelOnUnload": true,
        "latest_time": "",
        "status_buckets": 0,
        "earliest_time": "0",
        "search": "| inputlookup WA_settings.csv\n" +
            "| outputlookup WA_settings\n" +
            "| stats count\n" +
            "| eval Message=count.\" rows were migrated to the KV store collection WA_settings\"\n" +
            "| fields - count",
        "app": utils.getCurrentApp(),
        "preview": true,
        "runWhenTimeIsUndefined": false,
        "autostart": false
    }, { tokens: true, tokenNamespace: "submitted" });
})
