require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {

    var CustomIconRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return cell.field === 'Check';
        },
        render: function($td, cell) {
            var Check = cell.value;

            // Compute the icon base on the field value
            var icon;
            if(!Check || Check==0 || (Check.indexOf("%") !=-1 && Check!="100.00%")) {
                icon = 'alert-circle';
            } else {
                icon = 'check';
            }

            // Create the icon element and add it to the table cell
            $td.addClass('icon-inline').html(_.template('<i class="icon-<%-icon%>"></i>', {
                icon: icon,
                text: cell.value
            }));
        }
    });
	function addCheckIcon(instance_id){
		mvc.Components.get(instance_id).getVisualization(function(tableView){
	        // Register custom cell renderer
	        tableView.table.addCellRenderer(new CustomIconRenderer());
	        // Force the table to re-render
	        tableView.table.render();
    	});	
	}
	
    addCheckIcon("check_" + "1");
    addCheckIcon("check_" + "2");
    addCheckIcon("check_" + "3");
    addCheckIcon("check_" + "4");
	
});