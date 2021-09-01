require([
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, mvc, TableView) {
    /* This adds inline icons on the documentation and sites setup page */
    var CustomIconRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return cell.field === 'Configured' || cell.field === 'Check';
        },
        render: function($td, cell) {
            var site = cell.value;

            // Compute the icon base on the field value
            var icon;
            if(site=="Maybe") {
                icon = 'warning';
            } else if (!site || site=="0" || site=="0.00%" || site=="") {
                icon = 'alert-circle';
            } else if (site) {
                icon = 'check';
            }

            // Create the icon element and add it to the table cell
            $td.addClass('icon-inline').html(_.template('<i class="icon-<%-icon%>"></i>', {
                icon: icon,
                text: cell.value
            }));
        }
    });
    if (mvc.Components.get('datacheck_table')) {
        mvc.Components.get('datacheck_table').getVisualization(function(tableView){
            // Register custom cell renderer
            tableView.table.addCellRenderer(new CustomIconRenderer());
            // Force the table to re-render
            tableView.table.render();
        });
    }



    for(var c = 1; c <= 3; c++){
    var table='datacheck_table_'+c
    if (mvc.Components.get(table)) {
        mvc.Components.get(table).getVisualization(function(tableView){
            // Register custom cell renderer
            tableView.table.addCellRenderer(new CustomIconRenderer());
            // Force the table to re-render
            tableView.table.render();
        });
    }
        
    }

});
