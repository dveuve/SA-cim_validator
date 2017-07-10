window.generalStatus = []

function checkOverallData(){
    require([
    'splunkjs/mvc',
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    'splunkjs/mvc/searchmanager',
    'jquery',
    'splunkjs/mvc/simplexml/ready!'],function(
    mvc,
    FormUtils,
        utils,
        TokenUtils,
        SearchManager,
        $
    ){
        var appName = utils.getCurrentApp()
        //var Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. Please supply additional data sources.<p>"
        var Response = '<table class="table" id="data_source_summary_table"><tr><td>Type</td><td>Data Type</td><td>Required?</td><td>Present?</td></tr>';
        var divid = "data_summary_overall"
        if(typeof window.generalStatus.identity == "undefined")
            window.generalStatus.identity = "err"
        Response += "<tr><td>Identity Data</td><td>Splunk Identity</td><td>Required</td><td id=\"status_identity\"><img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/" + window.generalStatus['identity'] + "_ico.gif\" title=\"" + window.generalStatus['identity'] + "\" /></td></tr>"
        Response += "<tr><td>Role Permissions</td><td>Splunk authorize.conf</td><td>Required</td><td id=\"status_role_checks\"><img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/" + window.generalStatus["role_checks"] + "_ico.gif\" title=\"" + window.generalStatus["role_checks"] + "\" /></td></tr>"

        var myTypes = {              
            "UBA_AD": 0,
            "UBA_Authentication": 0,
            "UBA_DHCP": 0,
            "UBA_DNS": 0,
            "UBA_Email": 0,
            "UBA_Firewall": 0,
            "UBA_Host_AV": 0,
            "UBA_Host_IDS": 0,
            "UBA_Network_IDS": 0,
            "UBA_Cloud": 0,
            "UBA_Secure_Web_Gateway": 0,
            "UBA_VPN": 0,
            "UBA_Proxy": 0}

        var myTypes_Pretty = {              
            "UBA_AD": "Active Directory",
            "UBA_Authentication": "General Authentication",
            "UBA_DHCP": "DHCP",
            "UBA_DNS": "DNS",
            "UBA_Email": "Email Transaction",
            "UBA_Firewall": "Firewall",
            "UBA_Host_AV": "Host-based AV",
            "UBA_Host_IDS": "Host-based IPS",
            "UBA_Network_IDS": "Network IDS",
            "UBA_Cloud": "Cloud / SaaS",
            "UBA_Secure_Web_Gateway": "Secure Web Gateway",
            "UBA_VPN": "VPN",
            "UBA_Proxy": "Secure Proxy"}
        var requiredTypes = ["UBA_AD","UBA_DHCP","UBA_VPN","UBA_Firewall","UBA_Proxy"]
        var preferredTypes = ["UBA_Host_AV","UBA_DNS"]

        $(".data_input").each(function(){
            id = this.id.substr(11); 
            token = mvc.Components.getInstance("default").attributes['dm_' + id]
            if(typeof token!="undefined" && token.length>0){
                myTypes[token] += 1
            }
        });
        var presentTypes = 0;
        var missingRequiredTypes = requiredTypes
        var presentRequiredTypes = []
        var missingPreferredTypes = preferredTypes
        var presentPreferredTypes = []
        
        for(var myType in myTypes){
            if(myTypes[myType]>0){
                presentTypes++;
            }
            if(typeof window.generalStatus[myType] == "undefined"){
                window.generalStatus[myType] = "ok"
            }
                  
            var isRequired = ""
            if(requiredTypes.indexOf(myType)>=0){
                isRequired = "Required"
            }else if(preferredTypes.indexOf(myType)>=0){
                isRequired = "Preferred"
            } 
            console.log("looking for myType..", myTypes[myType], myType, isRequired)
            if(isRequired == "Required"){
                if(myTypes[myType]>0 && window.generalStatus[myType] == "ok"){
                    window.generalStatus[myType] = "ok"
                }else{
                    window.generalStatus[myType] = "err"
                }
            }else if(isRequired == "Preferred"){
                if(myTypes[myType]>0 && window.generalStatus[myType] == "ok"){
                    window.generalStatus[myType] = "ok"
                }else{
                    window.generalStatus[myType] = "warn"
                }
            }else{
                if(myTypes[myType]>0 && window.generalStatus[myType] == "ok"){
                    window.generalStatus[myType] = "ok"
                }else{
                    window.generalStatus[myType] = "hide"
                }
            }
            if(window.generalStatus[myType] != "hide")
                Response += "<tr><td>Source</td><td>" + myTypes_Pretty[myType] + "</td><td>" + isRequired + "</td><td id=\"status_" + myType + "\"><img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/" + window.generalStatus[myType] + "_ico.gif\" title=\"" + window.generalStatus[myType] + "\" /></td></tr>";
            else
                Response += "<tr><td>Source</td><td>" + myTypes_Pretty[myType] + "</td><td>" + isRequired + "</td><td id=\"status_" + myType + "\"></td></tr>";
        }
       
        Response += "</table>"
        $("#data_summary_overall").html(Response)
        
        
    })
    
}

function saveState(){
     require([
    'splunkjs/mvc',
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'],function(
    mvc,
    FormUtils,
        utils,
        TokenUtils,
        SearchManager
    ){
        
        var appName = utils.getCurrentApp()
        var SearchString = ""
        $(".data_input:visible:contains(Target datamodel)").each(function(){
            id = this.id.substr(11); 
            RunCheck(id)
            if(typeof mvc.Components.getInstance("default").attributes['cim_search_' + id] != "undefined" && mvc.Components.getInstance("default").attributes['cim_search_' + id].length > 0){
                if(SearchString == ""){
                    SearchString += "| makeresults | fields - _time | eval datamodel=$dm_" + id + "|s$ | eval search=$cim_search_" + id + "|s$"
                }else{
                    SearchString += "| append [makeresults | fields - _time | eval datamodel=$dm_" + id + "|s$ | eval search=$cim_search_" + id + "|s$]"
                }
                console.log(SearchString)
            } 
        })

        var identitySearch = mvc.Components.getInstance("identity_data_base_search_input").val().replace(/\\/g, "\\\\").replace(/\"/g, "\\\"").replace(/\$/g, "$$$")
        if(SearchString=="" && identitySearch != "" && identitySearch!="| inputlookup LDAPSearch.csv"){
            SearchString="| makeresults | fields - _time | eval datamodel=\"UBA_Identity\", search=\"" + identitySearch + "\""
        }else if(identitySearch != "" && identitySearch!="| inputlookup LDAPSearch.csv"){
            SearchString += "| append [| makeresults | fields - _time | eval datamodel=\"UBA_Identity\", search=\"" + identitySearch + "\"]"
        }

        
        if(SearchString=="" && document.getElementById("role_check_perm").value != "" && document.getElementById("role_check_perm").value!="admin"){
            SearchString="| makeresults | fields - _time | eval datamodel=\"role_check_perm\", search=\"" + document.getElementById("role_check_perm").value + "\""
        }else if(identitySearch != "" && document.getElementById("role_check_perm").value != "" && document.getElementById("role_check_perm").value!="admin"){
            SearchString += "| append [| makeresults | fields - _time | eval datamodel=\"role_check_perm\", search=\"" + document.getElementById("role_check_perm").value + "\"]"
        }

        
        if(SearchString != ""){
            SearchString += " | outputlookup cim_data_input_saved.csv"
            console.log("Saving Context...", SearchString)

            var saveStateSearch = mvc.Components.getInstance("saveStateSearch")
            if(typeof saveStateSearch == "undefined"){
                var saveStateSearch = new SearchManager({
                    "id": "saveStateSearch",
                    "sample_ratio": null,
                    "search": SearchString,
                    "latest_time": "now",
                    "status_buckets": 0,
                    "cancelOnUnload": true,
                    "earliest_time": "0",
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false
                }, {tokens: true, tokenNamespace: "submitted"});
            }else{
                mvc.Components.getInstance("saveStateSearch").set("search", SearchString)
                mvc.Components.getInstance("saveStateSearch").unset("search")
                mvc.Components.getInstance("saveStateSearch").startSearch()
            }

        }
        $("#saveStateButton")[0].textContent = "Saving..."
        setTimeout(function(){
            $("#saveStateButton")[0].textContent = "Saved."
            setTimeout(function(){
                $("#saveStateButton")[0].textContent = "Re-Save State"
            },1000)
        },1000)

    })
}



function loadState(){
     require([
    'splunkjs/mvc',
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'],function(
    mvc,
    FormUtils,
        utils,
        TokenUtils,
        SearchManager
    ){
        
        var appName = utils.getCurrentApp()
        var SearchString = " | inputlookup cim_data_input_saved.csv"
        console.log("Loading Context...", SearchString)

        var loadStateSearch = mvc.Components.getInstance("loadStateSearch")
        if(typeof loadStateSearch == "undefined"){
            var loadStateSearch = new SearchManager({
                "id": "loadStateSearch",
                "sample_ratio": null,
                "search": SearchString,
                "latest_time": "now",
                "status_buckets": 0,
                "cancelOnUnload": true,
                "earliest_time": "0",
                "app": utils.getCurrentApp(),
                "auto_cancel": 90,
                "preview": true,
                "runWhenTimeIsUndefined": false
            }, {tokens: true, tokenNamespace: "submitted"});
        }else{
            mvc.Components.getInstance("loadStateSearch").set("search", SearchString)
            mvc.Components.getInstance("loadStateSearch").startSearch()
        }
        var loadStateResults = loadStateSearch.data('results', { output_mode:'json', count:0 });
        loadStateSearch.on('search:done', function(properties) {
            if(loadStateSearch.attributes.data.resultCount == 0) {
              return;
            }       
            loadStateResults.on("data", function() {
                var data = loadStateResults.data().results;
                console.log("Here are my restore results", loadStateSearch, data) 
               
                $(".data_input").each(function(){
                    id = this.id.substr(11); 
                    removeSource(id)
                    
                })


                for(var datum in data){
                    if("search" in data[datum] && "datamodel" in data[datum] && typeof data[datum].search !="undefined" && typeof data[datum].datamodel !="undefined" && data[datum].datamodel !="UBA_Identity" && data[datum].datamodel != "role_check_perm"){
                        console.log("Adding Row with ", data[datum].datamodel, data[datum].search)
                        window.addRow(data[datum].datamodel, data[datum].search)
                        window.generalStatus[data[datum].datamodel] = "ok"

                    }else if("search" in data[datum] && "datamodel" in data[datum] && typeof data[datum].search !="undefined" && typeof data[datum].datamodel !="undefined" && data[datum].datamodel=="UBA_Identity"){
                        console.log("Got an identity data lookup!")
                        mvc.Components.getInstance("identity_data_base_search_input").val(data[datum].search)
                        window.launch_identity_base_search()

                    }else if("search" in data[datum] && "datamodel" in data[datum] && typeof data[datum].search !="undefined" && typeof data[datum].datamodel !="undefined" && data[datum].datamodel=="role_check_perm"){
                        $("#role_check_perm").attr("value", data[datum].search)
                        $("#role_check_update").click()
                        
                    }

                    
                }
                $(".data_input").each(function(){
                    id = this.id.substr(11); 
                    RunCheck(id)
                });

            });
          });


    })
}

function removeSource(id){
    require([
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'],function(
    mvc
    ){
        console.log("Clearing out source", id)
        
        splunkjs.mvc.Components.getInstance("submitted").unset('dm_' + id)
        splunkjs.mvc.Components.getInstance("submitted").unset('cim_search_' + id)
        splunkjs.mvc.Components.getInstance("submitted").unset('form.dm_' + id)
        splunkjs.mvc.Components.getInstance("submitted").unset('form.cim_search_' + id)
        splunkjs.mvc.Components.getInstance("fields_all_" + id).dispose()
        splunkjs.mvc.Components.getInstance("fields_required_" + id).dispose()
        splunkjs.mvc.Components.getInstance("fields_preferred_" + id).dispose()
        splunkjs.mvc.Components.getInstance("fields_tags_" + id).dispose()
        splunkjs.mvc.Components.getInstance("input2_" + id).dispose()
        splunkjs.mvc.Components.getInstance("vsearch_bar_" + id).dispose()
        splunkjs.mvc.Components.getInstance("cim_base_" + id).dispose()
        $("#data_input_" + id).remove()
    })
}

function openValidation(id){
     require([
    'splunkjs/mvc',
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    'splunkjs/mvc/simplexml/ready!'],function(
    mvc,
    FormUtils,
        utils,
        TokenUtils
    ){
        var appName = utils.getCurrentApp()
        var datamodel = encodeURI(mvc.Components.getInstance('default').get("dm_" + id))
        var search = encodeURI(mvc.Components.getInstance('default').get("cim_search_" + id)).replace(/=/g,"%3D")
        var earliest = encodeURI(mvc.Components.getInstance('default').get("timerange.earliest"))
        var latest = encodeURI(mvc.Components.getInstance('default').get("timerange.latest"))
        window.open("/app/" + appName + "/cim_validator?form.search_type=search&form.dm="+ datamodel + "&form.event_limit=10000&form.timerange.earliest=" + earliest + "&form.timerange.latest=" + latest + "&form.cim_search=" + search, '_blank')
    })
}

function RunCheck(id){
   require([
    'splunkjs/mvc',
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    'splunkjs/mvc/simplexml/ready!'],function(
    mvc,
    FormUtils,
        utils,
        TokenUtils
    ){

        var appName = utils.getCurrentApp()
        var newTokens = {}; 
        for( var token in mvc.Components.getInstance('default').attributes){
            if(token.indexOf(id) > 0){ 
                newTokens[token] = mvc.Components.getInstance('default').attributes[token];
            }
        }; 
        if(typeof newTokens['cim_base_' + id] !="undefined" && newTokens['cim_base_' + id].length>0){
            splunkjs.mvc.Components.getInstance('submitted').set(newTokens)
            splunkjs.mvc.Components.getInstance('cim_search_' + id).startSearch()
        }
        checkOverallData()
    })
}

require([
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc',
    'underscore',
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/radiogroup",
    "splunkjs/mvc/simpleform/input/linklist",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/checkboxgroup",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/timerange",
    "splunkjs/mvc/simpleform/input/submit",
    "splunkjs/mvc/postprocessmanager",
    'splunkjs/mvc/simplexml/ready!'],function(
    TableView,
    SearchManager,
    mvc,
    _,
    FormUtils,
        utils,
        TokenUtils,
        DropdownInput,
        RadioGroupInput,
        LinkListInput,
        MultiSelectInput,
        CheckboxGroupInput,
        TextInput,
        TimeRangeInput,
        SubmitButton,
        PostProcessManager
    ){

        var appName = utils.getCurrentApp()
        var search9 = new SearchManager({
            "id": "datamodel_search",
            "sample_ratio": null,
            "search": "| datamodel            | spath modelName           | table modelName           | sort  modelName",
            
            "status_buckets": 0,
            "cancelOnUnload": true,
            
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true});

        var input1 = new TimeRangeInput({
            "id": "input1",
            "searchWhenChanged": true,
            "default": {"latest_time": "now", "earliest_time": "-30d@d"},
            "earliest_time": "$form.timerange.earliest$",
            "latest_time": "$form.timerange.latest$",
            "el": $('#input1')
        }, {tokens: true}).render();

        input1.on("change", function(newValue) {
            FormUtils.handleValueChange(input1);

                $(".data_input").each(function(){
                    id = this.id.substr(11); 
                    RunCheck(id)
                    
                })

        });


    function addRow(passed_datamodel, passed_searchString){
        
        if(typeof passed_searchString == "undefined"){
            passed_searchString = ""
        }
        if(typeof passed_datamodel == "undefined"){
            passed_datamodel = ""
        }
        console.log("Received the following datamodel and search string", passed_datamodel, passed_searchString)
        var id =  Math.round(Math.random()*100000)
        var div = $("<div>", {id: "data_input_" + id, "class": "data_input"});

        div.html('\
    <div class="fieldset">\
        <div class="input input-dropdown" id="input2_' + id + '">\
            <label>Target datamodel:</label>\
        </div>\
        <div class="input input-text" id="vsearch_bar_' + id + '">\
            <label>Search:</label>\
        </div>\
        <div style="display:inline-block;  width: 80px; height: 60px; text-align: center; margin: auto;" id="fields_remove_link_'+ id + '"><a href=\"#\" onclick=\"removeSource(' + id + '); return false;\">Remove</a></div>\
        <div style="display:inline-block;  width: 80px; height: 60px; text-align: center; margin: auto;" id="fields_required_'+ id + '"><h3>Required</h3></div>\
        <div style="display:none;  width: 80px; height: 60px; text-align: center; margin: auto;" id="fields_preferred_'+ id + '"><h3>Preferred</h3></div>\
        <div style="display:inline-block;  width: 80px; height: 60px; text-align: center; margin: auto;" id="fields_all_'+ id + '"><h3>All</h3></div>\
        <div style="display:inline-block;  width: 80px; height: 60px; text-align: center; margin: auto;" id="submit_'+ id + '"><button class="btn btn-primary " id="submitButton_' + id + '" onclick="RunCheck('+id+')">Run Check</button></div>\
        <div style="display:inline-block;  width: 150px; height: 60px; text-align: center; margin: auto;" id="link_'+ id + '"><a href="javascript:openValidation('+id+')">Open in Validation View</a></div>\
        <div style="display:inline-block;  max-width: 450px;" id="fields_errors_'+ id + '"></div>')

        $("#data_inputs").append(div);


        var input2 = new DropdownInput({
            "id": "input2_" + id,
            "choices": [],
            "searchWhenChanged": true,
            "valueField": "modelName",
            "showClearButton": true,
            "labelField": "modelName",
            "default": passed_datamodel,
            "selectFirstChoice": false,
            "value": "$form.dm_" + id + "$",
            "managerid": "datamodel_search",
            "el": $('#input2_' + id)
        }, {tokens: true}).render();

        input2.on("change", function(newValue) {
            FormUtils.handleValueChange(input2);
            window.generalStatus[newValue] = "ok"
            UpdateSearchStringForId(this.id.substr(7))
            
        });
        
        
        var vsearch_bar = new TextInput({
            "id": "vsearch_bar_" + id,
            "value": "$form.cim_search_" + id + "$",
            "default": passed_searchString,
            "el": $('#vsearch_bar_' + id)
        }, {tokens: true}).render();

        vsearch_bar.on("change", function(newValue) {
            FormUtils.handleValueChange(vsearch_bar);
            UpdateSearchStringForId(this.id.substr(12))
            
        });



        var search4 = new PostProcessManager({
            "search": "| stats count(eval(is_required=\"required\")) as count sum(eval(if(is_required=\"required\" AND NOT match(is_cim_valid, \"^low\"), 1, 0))) AS bad | eval percent=round((1 -(bad/count))*100) | table percent",
            "managerid": "cim_base_" + id,
            "id": "fields_required_" + id
        }, {tokens: true, tokenNamespace: "submitted"});

        
        var myResults4 = search4.data('results', { output_mode:'json', count:0 });
        search4.on('search:done', function(properties) {
            if(search4.attributes.data.resultCount == 0) {
              return;
            }       
            myResults4.on("data", function() {
                var data = myResults4.data().results;
                console.log("Here are my results", search4, data)
                var mycolor=""
                if(data[0].percent <= 99){
                    mycolor = "color: darkred;"
                    if(typeof window.generalStatus[mvc.Components.getInstance("input2_" + id).val()] == "undefined"){
                        window.generalStatus[mvc.Components.getInstance("input2_" + id).val()] = "ok"
                    }
                    window.generalStatus[mvc.Components.getInstance("input2_" + id).val()] = "err"
                    console.log("just set ", mvc.Components.getInstance("input2_" + id).val(), window.generalStatus[mvc.Components.getInstance("input2_" + id).val()])
                    checkOverallData()

                }else if(data[0].percent <= 100){
                    mycolor = "color: darkgreen;"
                }

                $("#fields_required_" + id).html("<h3>Required</h3>\n<center><bold style=\"" + mycolor + "\">" + data[0].percent + "%</bold></center>") 
            });
          });

        var search5 = new PostProcessManager({
            "search": "| stats count(eval(is_required=\"required\" OR is_required=\"preferred\")) as count sum(eval(if((is_required=\"required\" OR is_required=\"preferred\") AND NOT match(is_cim_valid, \"^low\"), 1, 0))) AS bad | eval percent=round((1 -(bad/count))*100) | table percent",
            "managerid": "cim_base_" + id,
            "id": "fields_preferred_" + id
        }, {tokens: true, tokenNamespace: "submitted"});

        
        var myResults5 = search5.data('results', { output_mode:'json', count:0 });
        search5.on('search:done', function(properties) {
            if(search5.attributes.data.resultCount == 0) {
              return;
            }       
            myResults5.on("data", function() {
                var data = myResults5.data().results;
                console.log("Here are my results", search5, data) 
                var mycolor=""
                if(data[0].percent <= 30){
                    mycolor = "color: darkred;"
                }else if(data[0].percent <= 80){
                    mycolor = "color: goldenrod;"
                }else if(data[0].percent <= 100){
                    mycolor = "color: darkgreen;"
                }
                $("#fields_preferred_" + id).html("<h3>Preferred</h3>\n<center><bold style=\"" + mycolor + "\">" + data[0].percent + "%</bold></center>") 
            });
          });

        var search6 = new PostProcessManager({
            "search": "| stats count sum(eval(if(match(is_cim_valid, \"^low\"), 0, 1))) AS bad | eval percent=round((1 -(bad/count))*100) | table percent",
            "managerid": "cim_base_" + id,
            "id": "fields_all_" + id
        }, {tokens: true, tokenNamespace: "submitted"});

        
        var myResults6 = search6.data('results', { output_mode:'json', count:0 });
        search6.on('search:done', function(properties) {
            if(search6.attributes.data.resultCount == 0) {
              return;
            }       
            myResults6.on("data", function() {
                var data = myResults6.data().results;
                console.log("Here are my results", search6, data) 
                var mycolor=""
                if(data[0].percent <= 20){
                    mycolor = "color: darkred;"
                }else if(data[0].percent <= 80){
                    mycolor = "color: goldenrod;"
                }else if(data[0].percent <= 100){
                    mycolor = "color: darkgreen;"
                }
                $("#fields_all_" + id).html("<h3>All</h3>\n<center><bold style=\"" + mycolor + "\">" + data[0].percent + "%</bold></center>") 
            });
          });

        var search7 = new PostProcessManager({
            "search": "| search field=\"tag\" | fields field_values | mvexpand field_values | rex field=field_values \"(?<percentage>.*?)\\s*(?<tag>\\S*)$\" | fields - field_values | eval datamodel=\"UBA_Proxy\" | eval coverage=case(datamodel!=\"UBA_Malware\" AND tag=\"malware\", \"You have some Malware data in your logs (\" . percentage . \"). While UBA 3.1 and above allows you to bring that in with one search, to use this tool accurately you should probably make sure that you don't have irrelevant data in this \" . datamodel . \" search. You can separately go evaluate your Malware data against UBA_Malware.\", 1=1, \"Everything looks good\") | stats values(coverage) as coverage | eval coverage=mvfilter(coverage!=\"Everything looks good\")",
            "managerid": "cim_base_" + id,
            "id": "fields_tags_" + id
        }, {tokens: true, tokenNamespace: "submitted"});

        
        var myResults7 = search7.data('results', { output_mode:'json', count:0 });
        search7.on('search:done', function(properties) {
            if(search7.attributes.data.resultCount == 0) {
              return;
            }       
            myResults7.on("data", function() {
                var data = myResults7.data().results;
                console.log("Here are my results for tags...", search7, data) 
                var errors=[]
                for(var datum in data){
                    if("coverage" in data[datum] && typeof data[datum].coverage !="undefined"){
                        if(data[datum].coverage == "Everything looks good"){
                            errors.push(data[datum].coverage)
                        }else{
                            errors.push("<span style=\"font-weight:bold; color: darkred;\">Warning:</span> " + data[datum].coverage)
                        }
                    }
                }
                $("#fields_errors_" + id).html(errors.join("<br />"))
            });
          });


        console.log("DV - Setting the search string to..", "| datamodel $dm_" + id + "$ | rex max_match=999 \"fieldName\\\":\\\"(?<field>[^\\\"]+)\" | stats values(field) as field | mvexpand field  | where NOT match(field, \"_time|host|sourcetype|source|[A-Z]+|_bunit|_category|_priority|_requires_av|_should_update\") OR match(field, \"object_category\")   | join type=outer field [ search $cim_search_" + id + "$ | head 10000 | fieldsummary maxvals=15 | eventstats max(count) AS total | eval percent_coverage=round(count/total*100, 2) | table field, percent_coverage, distinct_count, total, values]  | spath input=values | rename {}.value AS sample_values {}.count AS sample_count distinct_count AS distinct_value_count total AS total_events  | fillnull value=0 percent_coverage, distinct_value_count, total_events   | mvmath field=sample_count field2=total_events | eval field_values=mvzip(mvmath_result, sample_values, \" \")  | lookup cim_validation_regex field | mvrex showcount=t showunmatched=t field=sample_values validation_regex  | eval is_cim_valid=case(total_events==0, \"severe!!!no extracted values found\", percent_coverage < 90, \"elevated!!!event coverage less than 90%\", mvrex_unmatched_count > 0, \"elevated!!!found \".mvrex_unmatched_count.\" unexpected values (\".mvjoin(mvrex_unmatched, \", \").\")\", isnull(validation_regex) OR validation_regex==\"\", \"check!!!no validation regex was found to evaluate\", 1==1, \"low!!!looking good!\")| eval datamodel=\"$dm_" + id + "$\" | lookup cim_dictionary.csv field datamodel  | table field, total_events, distinct_value_count, percent_coverage, field_values, is_required, is_cim_valid, description")
        var mySearchString = "| datamodel $dm_" + id + "$ | rex max_match=999 \"fieldName\\\":\\\"(?<field>[^\\\"]+)\" | stats values(field) as field | mvexpand field  | where NOT match(field, \"_time|host|sourcetype|source|[A-Z]+|_bunit|_category|_priority|_requires_av|_should_update\") OR match(field, \"object_category\")   | join type=outer field [search $cim_search_" + id + "$ | head 10000 | fieldsummary maxvals=15 | eventstats max(count) AS total | eval percent_coverage=round(count/total*100, 2) | table field, percent_coverage, distinct_count, total, values]  | spath input=values | rename {}.value AS sample_values {}.count AS sample_count distinct_count AS distinct_value_count total AS total_events  | fillnull value=0 percent_coverage, distinct_value_count, total_events   | mvmath field=sample_count field2=total_events | eval field_values=mvzip(mvmath_result, sample_values, \" \") | join type=outer field [| rest splunk_server=local /servicesNS/-/" + appName + "/data/models/$dm_" + id + "$ | eval myfield=spath('eai:data', \"objects{}.fields{}\") | fields myfield | mvexpand myfield | spath input=myfield | append [| rest splunk_server=local /servicesNS/-/" + appName + "/data/models/$dm_" + id + "$ | table eai:data | rename eai:data as _raw| eval myfield=spath(_raw, \"objects{}.calculations{}.outputFields{}\") | where isnotnull(myfield) | fields myfield | mvexpand myfield | spath input=myfield ]| rename fieldName as field regex as validation_regex | fields field comment possibleValues validation_regex is_required] | lookup cim_validation_regex field OUTPUTNEW | mvrex showcount=t showunmatched=t field=sample_values validation_regex  | eval is_cim_valid=case(total_events==0, \"severe!!!no extracted values found\", percent_coverage < 90, \"elevated!!!event coverage less than 90%\", mvrex_unmatched_count > 0, \"elevated!!!found \".mvrex_unmatched_count.\" unexpected values (\".mvjoin(mvrex_unmatched, \", \").\")\", isnull(validation_regex) OR validation_regex==\"\", \"check!!!no validation regex was found to evaluate\", 1==1, \"low!!!looking good!\")| eval datamodel=\"$dm_" + id + "$\" | lookup cim_dictionary.csv field datamodel OUTPUTNEW | table field, total_events, distinct_value_count, percent_coverage, field_values, is_required, is_cim_valid, description"
        if(passed_searchString.indexOf("inputlookup") > 0 || passed_searchString.indexOf("datamodel search") > 0){
            mySearchString = mySearchString.replace("[search", "[")
        }
        var cim_base = new SearchManager({
            "id": "cim_base_" + id,
            "sample_ratio": null,
            "search": "",
            //"search": DefineNewSearchString(id, passed_searchString),
            "latest_time": "$timerange.latest$",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": "$timerange.earliest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        UpdateSearchStringForId(id)
        var myResults = cim_base.data('results', { output_mode:'json', count:0 });
        cim_base.on('search:done', function(properties) {
            if(cim_base.attributes.data.resultCount == 0) {
              $("#fields_required_" + id).html("<h3>Required</h3>\n<center></center>") 
            $("#fields_preferred_" + id).html("<h3>Required</h3>\n<center></center>") 
            $("#fields_optional_" + id).html("<h3>Required</h3>\n<center></center>") 
          return;
            }       
            myResults.on("data", function() {
                var data = myResults.data().results;
                console.log("Here are my results", cim_base, data) 
            });
          });

        cim_base.on('search:start', function(properties) {
            if(typeof mvc.Components.getInstance("default").attributes["cim_search_" + id] != "undefined" && mvc.Components.getInstance("default").attributes["cim_search_" + id].length){
                $("#fields_required_" + id).html("<h3>Required</h3>\n<center><img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/icon_processing.gif\" title=\"Processing...\" /></center>") 
                $("#fields_preferred_" + id).html("<h3>Required</h3>\n<center><img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/icon_processing.gif\" title=\"Processing...\" /></center>") 
                $("#fields_optional_" + id).html("<h3>Required</h3>\n<center><img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/icon_processing.gif\" title=\"Processing...\" /></center>") 
            }
          });



    }
    window.addRow = addRow;
    addRow();
    $("#saveStateButton").click(function(){saveState()})
    $("#loadStateButton").click(function(){loadState()})
    $("#addRowButton").click(function(){window.addRow()})

    function UpdateSearchStringForId(id){
        console.log("Updating everything for ", id)
        if(mvc.Components.getInstance("vsearch_bar_" + id) && mvc.Components.getInstance("input2_" + id)){
            var passed_searchString = mvc.Components.getInstance("vsearch_bar_" + id).val()
            var dm = mvc.Components.getInstance("input2_" + id).val()
            if(dm!="undefined" && passed_searchString !="undefined"){
                var mySearchString = "| datamodel $dm_" + id + "$ | rex max_match=999 \"fieldName\\\":\\\"(?<field>[^\\\"]+)\" | stats values(field) as field | mvexpand field  | where NOT match(field, \"_time|host|sourcetype|source|[A-Z]+|_bunit|_category|_priority|_requires_av|_should_update\") OR match(field, \"object_category\")   | join type=outer field [search $cim_search_" + id + "$ | head 10000 | fieldsummary maxvals=15 | eventstats max(count) AS total | eval percent_coverage=round(count/total*100, 2) | table field, percent_coverage, distinct_count, total, values]  | spath input=values | rename {}.value AS sample_values {}.count AS sample_count distinct_count AS distinct_value_count total AS total_events  | fillnull value=0 percent_coverage, distinct_value_count, total_events   | mvmath field=sample_count field2=total_events | eval field_values=mvzip(mvmath_result, sample_values, \" \") | join type=outer field [| rest splunk_server=local /servicesNS/-/" + appName + "/data/models/$dm_" + id + "$ | eval myfield=spath('eai:data', \"objects{}.fields{}\") | fields myfield | mvexpand myfield | spath input=myfield | append [| rest splunk_server=local /servicesNS/-/" + appName + "/data/models/$dm_" + id + "$ | table eai:data | rename eai:data as _raw| eval myfield=spath(_raw, \"objects{}.calculations{}.outputFields{}\") | where isnotnull(myfield) | fields myfield | mvexpand myfield | spath input=myfield ]| rename fieldName as field regex as validation_regex | fields field comment possibleValues validation_regex is_required] | lookup cim_validation_regex field OUTPUTNEW | mvrex showcount=t showunmatched=t field=sample_values validation_regex  | eval is_cim_valid=case(total_events==0, \"severe!!!no extracted values found\", percent_coverage < 90, \"elevated!!!event coverage less than 90%\", mvrex_unmatched_count > 0, \"elevated!!!found \".mvrex_unmatched_count.\" unexpected values (\".mvjoin(mvrex_unmatched, \", \").\")\", isnull(validation_regex) OR validation_regex==\"\", \"check!!!no validation regex was found to evaluate\", 1==1, \"low!!!looking good!\")| eval datamodel=\"$dm_" + id + "$\" | lookup cim_dictionary.csv field datamodel OUTPUTNEW | table field, total_events, distinct_value_count, percent_coverage, field_values, is_required, is_cim_valid, description"
                if(passed_searchString.indexOf("inputlookup") > 0 || passed_searchString.indexOf("datamodel search") > 0){
                    mySearchString = mySearchString.replace("[search", "[")
                }
                
                mySearchString = mySearchString.replace(/\$dm_\d*\$/g, dm).replace(/\$cim_search_\d*\$/g, passed_searchString)
                
                
                    mvc.Components.getInstance("cim_base_" + id).settings.unset("search")
                    mvc.Components.getInstance("cim_base_" + id).settings.set("search", mySearchString)
                   
            }
        }
    }

});




require([
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc',
    'underscore',
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/radiogroup",
    "splunkjs/mvc/simpleform/input/linklist",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/checkboxgroup",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/timerange",
    "splunkjs/mvc/simpleform/input/submit",
    "splunkjs/mvc/postprocessmanager",
    'splunkjs/mvc/simplexml/ready!'],function(
    TableView,
    SearchManager,
    mvc,
    _,
    FormUtils,
        utils,
        TokenUtils,
        DropdownInput,
        RadioGroupInput,
        LinkListInput,
        MultiSelectInput,
        CheckboxGroupInput,
        TextInput,
        TimeRangeInput,
        SubmitButton,
        PostProcessManager
    ){
        mvc.Components.getInstance("submitted").set("role_check_username",document.getElementById("role_check_perm").value )
        $("#role_check_update").on("click", function(){
            console.log("got", document.getElementById("role_check_perm").value )
            var unsubmitted = mvc.Components.getInstance("default")
            unsubmitted.set("role_check_username", document.getElementById("role_check_perm").value )
            mvc.Components.getInstance("submitted").set("role_check_username", document.getElementById("role_check_perm").value )
            mvc.Components.getInstance("role_search").startSearch()

        })
        var appName = utils.getCurrentApp()
        $("#role_check_results").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/icon_processing.gif\" title=\"Processing...\" />")
        //role_check_perm


        var role_search = new SearchManager({
            "id": "role_search",
            "sample_ratio": null,
            "search": "| rest splunk_server=local /servicesNS/-/-/admin/quota-usage/$role_check_username$  | transpose| search column=rtSrchJobsQuota | rename \"row 1\" as Number_Of_Realtime_Jobs | eval status=case(Number_Of_Realtime_Jobs>=10, \"ok\", Number_Of_Realtime_Jobs>=5, \"warn\", 1=1, \"err\"), result=case(Number_Of_Realtime_Jobs>=10, \"Check Passed for user $role_check_username$\", Number_Of_Realtime_Jobs>=5, \"Warning for user $role_check_username$. Fewer than normal realtime jobs are available, though usually this number is sufficient.\", Number_Of_Realtime_Jobs>=1, \"Check Failed for user $role_check_username$ -- we can run in real-time, but fewer concurrent jobs than usually required.\", Number_Of_Realtime_Jobs<=0, \"Check Failed for user $role_check_username$. No Real Time Searches Enabled.\") ",
            "latest_time": "$timerange.latest$",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": "$timerange.earliest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        
        var myResults = role_search.data('results', { output_mode:'json', count:0 });
        role_search.on('search:done', function(properties) {
            if(role_search.attributes.data.resultCount == 0) {
                $("#role_check_results").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/err_ico.gif\" title=\"Error\" /> <b>Error running checks</b> -- validate username.")
              return;
            }       
            myResults.on("data", function() {
                var data = myResults.data().results;
                console.log("Here are my results", role_search, data) 
                for(var datum in data){
                    if(datum == "0")
                        datum = data[datum]
                    console.log("Hey look I got something! ", datum)
                    if(typeof datum['status'] != "undefined"){
                        
                        $("#role_check_results").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/" + datum['status'] + "_ico.gif\" title=\"" + datum['status'] + "\" /> <b>" + datum['result'] + "</b>")
                        window.generalStatus["role_checks"] = datum['status']
                        checkOverallData()
                        
                    }
                }
            });
          });

        role_search.on('search:start', function(properties) {
            $("#role_check_results").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/icon_processing.gif\" title=\"Processing...\" />")
          });



    })