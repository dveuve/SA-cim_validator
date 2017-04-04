function checkOverallData(){
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
        var Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. Please supply additional data sources.<p>"
        var divid = "data_summary_overall"
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
        var requiredTypes = ["UBA_AD","UBA_DHCP","UBA_DNS","UBA_Firewall","UBA_Proxy"]
        var preferredTypes = ["UBA_Host_AV","UBA_VPN"]

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
            if(missingRequiredTypes.indexOf(myType)>=0 && myTypes[myType]>0){
                missingRequiredTypes.splice(missingRequiredTypes.indexOf(myType), 1)
                presentRequiredTypes.push(myType)
            }        
            if(missingPreferredTypes.indexOf(myType)>=0 && myTypes[myType]>0){
                missingPreferredTypes.splice(missingPreferredTypes.indexOf(myType), 1)
                presentPreferredTypes.push(myType)
            }        
        }
        for(var i = 0; i < missingRequiredTypes.length; i++){missingRequiredTypes[i] = myTypes_Pretty[missingRequiredTypes[i]];}
        for(var i = 0; i < missingPreferredTypes.length; i++){missingPreferredTypes[i] = myTypes_Pretty[missingPreferredTypes[i]];}
        for(var i = 0; i < presentRequiredTypes.length; i++){presentRequiredTypes[i] = myTypes_Pretty[presentRequiredTypes[i]];}
        for(var i = 0; i < presentPreferredTypes.length; i++){presentPreferredTypes[i] = myTypes_Pretty[presentPreferredTypes[i]];}
        if(presentTypes == 0){
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. Please add your data sources.<p>"
        }else if(missingRequiredTypes.length>0 && missingPreferredTypes.length>0 && presentPreferredTypes.length>0 && presentRequiredTypes.length>0){
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. It is great that you have required sources (" + presentRequiredTypes.join(", ") + ") and preferred sources (" + presentPreferredTypes.join(", ") + "), but you are still missing required (" + missingRequiredTypes.join(", ") + ") and preferred (" + missingPreferredTypes.join(", ") + ") types. Please add additional data sources.<p>"
        }else if(missingRequiredTypes.length>0 && missingPreferredTypes.length>0 && presentPreferredTypes.length==0 && presentRequiredTypes.length>0){
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. It is great that you have required sources (" + presentRequiredTypes.join(", ") + "), but you are still missing required (" + missingRequiredTypes.join(", ") + ") and preferred (" + missingPreferredTypes.join(", ") + ") types. Please add additional data sources.<p>"
        }else if(missingRequiredTypes.length>0 && missingPreferredTypes.length>0 && presentPreferredTypes.length>0 && presentRequiredTypes.length==0){
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. It is great that you have preferred sources (" + presentPreferredTypes.join(", ") + "), but you are still missing required (" + missingRequiredTypes.join(", ") + ") and preferred (" + missingPreferredTypes.join(", ") + ") types. Please add additional data sources.<p>"
        }else if(presentPreferredTypes.length==0 && presentRequiredTypes.length==0){
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. It is great that you added some sources, but you are still missing required (" + missingRequiredTypes.join(", ") + ") and preferred (" + missingPreferredTypes.join(", ") + ") types. Please add additional data sources.<p>"
        }else if(missingRequiredTypes.length==0 && missingPreferredTypes.length>0){
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. You have all the required sources, which is great! Double check their completion percentage above, though, and if you have them, add preferred (" + missingPreferredTypes.join(", ") + ") sources.<p>"
        }else if(missingRequiredTypes.length>0 && missingPreferredTypes.length==0){
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. You have all the (non-required but) preferred sources, which is great! Double check their completion percentage above, though, and add the required (" + missingRequiredTypes.join(", ") + ") sources.<p>"
        }else{
            Response = "<p>UBA requires at least data from AD, Proxy, Firewall, DNS, and DHCP, and gets great additional value out of VPN, Endpoint Security, Network Security, and Cloud sources. Please add your data sources.<p>"
        }
        console.log("Response", Response, missingRequiredTypes.length, missingPreferredTypes.length, presentPreferredTypes.length, presentRequiredTypes.length)
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
                console.log("Here are my results", loadStateSearch, data) 
               
                $(".data_input").each(function(){
                    id = this.id.substr(11); 
                    removeSource(id)
                    
                })


                for(var datum in data){
                    if("search" in data[datum] && "datamodel" in data[datum] && typeof data[datum].search !="undefined" && typeof data[datum].datamodel !="undefined"){
                        console.log("Adding Row with ", data[datum].datamodel, data[datum].search)
                        window.addRow(data[datum].datamodel, data[datum].search)

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
        var datamodel = encodeURI(mvc.Components.getInstance('default').get("dm_" + id))
        var search = encodeURI(mvc.Components.getInstance('default').get("cim_search_" + id)).replace(/=/g,"%3D")
        var earliest = encodeURI(mvc.Components.getInstance('default').get("timerange.earliest"))
        var latest = encodeURI(mvc.Components.getInstance('default').get("timerange.latest"))
        window.open("/app/SA-cim_validator/cim_validator?form.search_type=search&form.dm="+ datamodel + "&form.event_limit=10000&form.timerange.earliest=" + earliest + "&form.timerange.latest=" + latest + "&form.cim_search=" + search, '_blank')
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
        <div style="display:inline-block;  width: 80px; height: 60px; text-align: center; margin: auto;" id="fields_preferred_'+ id + '"><h3>Preferred</h3></div>\
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
        });
        
        
        var vsearch_bar = new TextInput({
            "id": "vsearch_bar_" + id,
            "value": "$form.cim_search_" + id + "$",
            "default": passed_searchString,
            "el": $('#vsearch_bar_' + id)
        }, {tokens: true}).render();

        vsearch_bar.on("change", function(newValue) {
            FormUtils.handleValueChange(vsearch_bar);
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
        var cim_base = new SearchManager({
            "id": "cim_base_" + id,
            "sample_ratio": null,
            "search": "| datamodel $dm_" + id + "$ | rex max_match=999 \"fieldName\\\":\\\"(?<field>[^\\\"]+)\" | stats values(field) as field | mvexpand field  | where NOT match(field, \"_time|host|sourcetype|source|[A-Z]+|_bunit|_category|_priority|_requires_av|_should_update\") OR match(field, \"object_category\")   | join type=outer field [search $cim_search_" + id + "$ | head 10000 | fieldsummary maxvals=15 | eventstats max(count) AS total | eval percent_coverage=round(count/total*100, 2) | table field, percent_coverage, distinct_count, total, values]  | spath input=values | rename {}.value AS sample_values {}.count AS sample_count distinct_count AS distinct_value_count total AS total_events  | fillnull value=0 percent_coverage, distinct_value_count, total_events   | mvmath field=sample_count field2=total_events | eval field_values=mvzip(mvmath_result, sample_values, \" \")  | lookup cim_validation_regex field | mvrex showcount=t showunmatched=t field=sample_values validation_regex  | eval is_cim_valid=case(total_events==0, \"severe!!!no extracted values found\", percent_coverage < 90, \"elevated!!!event coverage less than 90%\", mvrex_unmatched_count > 0, \"elevated!!!found \".mvrex_unmatched_count.\" unexpected values (\".mvjoin(mvrex_unmatched, \", \").\")\", isnull(validation_regex) OR validation_regex==\"\", \"check!!!no validation regex was found to evaluate\", 1==1, \"low!!!looking good!\")| eval datamodel=\"$dm_" + id + "$\" | lookup cim_dictionary.csv field datamodel  | table field, total_events, distinct_value_count, percent_coverage, field_values, is_required, is_cim_valid, description",
            "latest_time": "$timerange.latest$",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": "$timerange.earliest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        
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
                $("#fields_required_" + id).html("<h3>Required</h3>\n<center><img style=\"width: 20px; height: 20px;\" src=\"/static/app/SA-cim_validator/icon_processing.gif\" title=\"Processing...\" /></center>") 
                $("#fields_preferred_" + id).html("<h3>Required</h3>\n<center><img style=\"width: 20px; height: 20px;\" src=\"/static/app/SA-cim_validator/icon_processing.gif\" title=\"Processing...\" /></center>") 
                $("#fields_optional_" + id).html("<h3>Required</h3>\n<center><img style=\"width: 20px; height: 20px;\" src=\"/static/app/SA-cim_validator/icon_processing.gif\" title=\"Processing...\" /></center>") 
            }
          });



    }
    window.addRow = addRow;
    addRow();
    $("#saveStateButton").click(function(){saveState()})
    $("#loadStateButton").click(function(){loadState()})
    $("#addRowButton").click(function(){window.addRow()})

});