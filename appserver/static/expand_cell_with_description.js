
require([
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc',
    "splunkjs/mvc/utils",
    'underscore',
    'splunkjs/mvc/simplexml/ready!'],function(
    TableView,
    SearchManager,
    mvc,
    utils,
    _
    ){
    
    var appName = utils.getCurrentApp()
    var EventSearchBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
        initialize: function(args) {
            // initialize will run once, so we will set up a search and a chart to be reused.
            this._searchManager = new SearchManager({
                id: 'details-search-manager',
                preview: false
            });
            this._tableView = new TableView({
                managerid: 'details-search-manager',
                'charting.legend.placement': 'none'
            });
        },
        canRender: function(rowData) {
            // Since more than one row expansion renderer can be registered we let each decide if they can handle that
            // data
            // Here we will always handle it.
            return true;
        },
        render: function($container, rowData) {
            // rowData contains information about the row that is expanded.  We can see the cells, fields, and values
            // We will find the field cell to use its value
            var fieldCell = _(rowData.cells).find(function (cell) {
               return cell.field === 'field';
            });
            var datamodel=mvc.Components.getInstance("submitted").get("dm")
            //update the search with the field that we are interested in
            this._searchManager.set({ search: ' | inputlookup cim_dictionary.csv | fields datamodel field description possible_values | eval source="csv" | append  [| rest splunk_server=local /servicesNS/-/' + appName + '/data/models/' + datamodel + ' | eval myfield=spath(\'eai:data\', "objects{}.fields{}") | fields myfield | mvexpand myfield | spath input=myfield | append [| rest splunk_server=local /servicesNS/-/' + appName + '/data/models/' + datamodel + ' | table eai:data | rename eai:data as _raw| eval myfield=spath(_raw, "objects{}.calculations{}.outputFields{}") | where isnotnull(myfield) | fields myfield | mvexpand myfield | spath input=myfield ]| fields fieldName comment possibleValues is_required| rename fieldName as field regex as validation_regex comment as description possibleValues as possible_values  | eval datamodel="' + datamodel + '", source="rest"] | search datamodel=' + datamodel + ' field=' + fieldCell.value + ' | sort - source | head 1  | fields - _* source| transpose | rename column as "Attribute" "row 1" as "Value"'});
            // $container is the jquery object where we can put out content.
            // In this case we will render our chart and add it to the $container
            $container.append(this._tableView.render().el);
        }
    });
    var tableElement = mvc.Components.getInstance("tmy_mv_table");
        
    tableElement.getVisualization(function(tableView) {
        // Add custom cell renderer, the table will re-render automatically.
        tableView.addRowExpansionRenderer(new EventSearchBasedRowExpansionRenderer());
    });
});