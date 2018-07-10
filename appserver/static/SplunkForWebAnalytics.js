require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
	'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {
	var tokens_submitted = mvc.Components.getInstance('submitted');
	var tokens_default = mvc.Components.getInstance('default');
	var local_apps = mvc.Components.get(mvc.Components.get('local_apps').managerid);
	
	$('#goal_save_button').on('click', function() {
        tokens_submitted.set('trigger', new Date());
	});

});