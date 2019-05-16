$("#addButton").css("display", "inline").html($("<button class=\"btn btn-primary\">Save config</button>").click(function() {
    postNewEntry()
}))
$("#deleteButton").css("display", "inline").html($("<button class=\"btn btn-primary errorColor\">Delete config</button>").click(function() {
    deleteEntry()
}))
$("#deleteButton button").css("background-color", "#dc4e41")

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
