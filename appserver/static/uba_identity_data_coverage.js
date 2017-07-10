

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
   
        console.log("Kicking off Identity Processing")
        $("#identity_data_container").append("<div id=\"identity_data_base_search_container\"><div style=\"display: inline-block\" id=\"identity_data_base_search_el\"></div><div style=\"display: inline-block\" id=\"identity_data_base_search_button\"><button class=\"btn btn-primary \" id=\"identity_data_launch\" onclick=\"window.launch_identity_base_search()\">Analyze</button>&nbsp;&nbsp;</div><div style=\"display: inline-block\" id=\"identity_data_base_search_progress\"></div></div><div><table class=\"table\" id=\"identity_data_individual_checks\" style=\"display: none\"><tr><td style=\"width: 350px\">Check</td><td style=\"width: 100px\">Status</td><td style=\"width: calc(100% - 450px)\">Description</td></tr></table>")

        var identity_data_base_search = new TextInput({
            "id": "identity_data_base_search_input",
            "value": "",
            "default": "| inputlookup LDAPSearch.csv",
            "el": $('#identity_data_base_search_el')
        }, {tokens: true}).render();
        $("#identity_data_base_search_el").find("input").css("width","800px")

        var cim_base = new SearchManager({
            "id": "identity_data_base_search",
            "sample_ratio": null,
            "search": "",
            //"search": DefineNewSearchString(id, passed_searchString),
            "latest_time": "now",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "earliest_time": "0",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "autostart": false,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});
        cim_base.on("search:start", function(){
            $("#identity_data_base_search_progress").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/icon_processing.gif\" title=\"Processing...\" />")
            $("#identity_data_individual_checks").css("display", "none")
        })
        cim_base.on("search:error", function(){
            $("#identity_data_base_search_progress").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/err_ico.gif\" title=\"Error\" />")
        })
        cim_base.on("search:fail", function(){
            $("#identity_data_base_search_progress").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/err_ico.gif\" title=\"Error\" />")
        })
        cim_base.on("search:cancelled", function(){
            $("#identity_data_base_search_progress").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/err_ico.gif\" title=\"Error\" />")
        })


            cim_base.on('search:done', function(properties) {
                if(cim_base.attributes.data.resultCount == 0) {
                  $("#identity_data_base_search_progress").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/err_ico.gif\" title=\"Error\" />")
                  window.generalStatus.identity = "err"
                } else{
                    window.generalStatus.identity = "ok"
                    $("#identity_data_base_search_progress").html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/ok_ico.gif\" title=\"Got Results\" />")
                    $("#identity_data_individual_checks").css("display", "block")
                    for(var name in window.HRChecks){if(window.HRChecks.hasOwnProperty(name)){
                        
                        $("#identity_data_check_" + name + '_status').html('<img style="width: 20px; height: 20px;" src="/static/app/' + appName + '/icon_processing.gif" title="Processing..." />')
                        $("#identity_data_check_" + name + '_description').html("")
                    }}
                }
                checkOverallData()

              });
        function launch_identity_base_search(){
            var newValue = mvc.Components.getInstance("identity_data_base_search_input").val()
            
            mvc.Components.getInstance("identity_data_base_search").settings.unset("search")
            mvc.Components.getInstance("identity_data_base_search").settings.set("search", newValue)
            mvc.Components.getInstance("identity_data_base_search").startSearch()
        }
        window.launch_identity_base_search = launch_identity_base_search
        identity_data_base_search.on("change", function(newValue) {
            FormUtils.handleValueChange(identity_data_base_search);
            //launch_identity_base_search()
            
        });
        window.HRChecks = []
        launchCheck("eid", "error", "Validate that an employeeid is defined for each record", '| stats count as total count(eval(isnull(employeeid) OR employeeid="")) as withouteid values(eval(if(isnull(employeeid) OR employeeid="", sAMAccountName, null))) as userwithouteid | eval status=if(withouteid=0, "ok", "bad"), description=if(withouteid=0, "Check Passed", "Not all user accounts have employeeIds. Out of " . total . " accounts, " . withouteid . " do not have an employeeid field defined. The first few accounts without are: " . mvjoin(mvindex(userwithouteid, 1,10), ", ")) ')
        launchCheck("hraccounttype", "error", "Validate that an hrAccountType is defined for each record", '| stats count as total count(eval(isnull(hrAccountType) OR hrAccountType="")) as withouttype values(eval(if(isnull(hrAccountType) OR hrAccountType="", sAMAccountName, null))) as userwithouttype | eval status=if(withouttype=0, "ok", "bad"), description=if(withouttype=0, "Check Passed", "Not all user accounts have an hrAccountType defined (e.g., admin, service, etc.). Out of " . total . " accounts, " . withouttype . " do not have an hrAccountType field defined. The first few accounts without are: " . mvjoin(mvindex(userwithouttype, 1,10), ", ")) ')
        launchCheck("round_number", "warn", "Validate that the number of records is not a round number", '| stats count | eval status = if(count % 1000 = 0, "bad", "ok"), description=if(count % 1000 = 0, "The number of records is an exact multiple of 1000 -- the odds of that are slim, so you probably hit a cap in your query to pull the HR Data and accidentally just have an even number", "Check Passed")')
        launchCheck("managerDN", "warn", "Validate the manager isn't a full distinguishedName", '| stats count as total count(eval(like(manager, "%CN=%"))) as error values(eval(if(like(manager, "%CN=%"), sAMAccountName, null))) as user_error | eval status=if(error=0, "ok", "bad"), description=if(error=0, "Check Passed", "Generally, we recommend removing the LDAP configuration from an manager, so that you see John Smith instead of CN=John Smith,ou=Managers,ou=sales,ou=myCompany,ou=internal. There is no practical impact to this as the information is provided just for context, but analysts prefer an easier to understand name. Out of " . total . " accounts, " . error . " have the LDAP configuration. The first few accounts without are: " . mvjoin(mvindex(user_error, 1,10), ", ") . ". We recommend clearing this out with the following search commands: | rex field=manager \\"CN=(?&lt;manager&gt;.*?),OU=\\" | rex mode=sed field=manager \\"s/\\\\\\//g\\" ")')
        launchCheck("groupDN", "warn", "Validate the group membership isn't a bunch of full distinguishedNames", '| eval memberOf=coalesce(memberOf, groups) | stats count(eval(isnotnull(memberOf) AND len(memberOf)!=0)) as total count(eval(like(memberOf, "%CN=%"))) as error values(eval(if(like(memberOf, "%CN=%"), sAMAccountName, null))) as user_error | eval user_error=coalesce(user_error,"...")| eval status=case(total=0, "bad", error=0, "ok", 1=1, "bad"), description=case(total=0, "No Group Membership found. Make sure you have defined a groups (or memberOf) field. ", error=0, "Check Passed", 1=1, "Generally, we recommend removing the LDAP configuration from group membership lists, so that you see Developers instead of CN=Developers,ou=Groups,ou=myCompany,ou=internal. There is no practical impact to this as the information is provided just for context, but analysts prefer an easier to understand name. Out of " . total . " accounts, " . error . " have the LDAP configuration. The first few accounts without are: " . mvjoin(mvindex(user_error, 1,10), ", ") . ". We recommend clearing this out with the following search commands: | rex max_match=0 field=memberOf \\"CN=(?&lt;groups&gt;.*?),OU=\\" | eval groups =mvjoin(groups, \\",\\") ") ')
        launchCheck("activeAccounts", "warn", "Validate the accounts are all active", '| stats count as total count(eval(NOT LIKE(UAC,"%NORMAL_ACCOUNT%"))) as error values(eval(if(NOT LIKE(userAccountControl,"%NORMAL_ACCOUNT%"), sAMAccountName, null))) as user_error | eval status=if(error=0, "ok", "bad"), description=if(error=0, "Check Passed", "Most customers only monitor active accounts in UBA, so that they avoid a legacy of old inactive accounts consuming system resources. This check looks to see if accounts being ingested are all active. Out of " . total . " accounts, " . error . " are not active. The first few accounts without are: " . mvjoin(mvindex(user_error, 1,10), ", ") . ". You may want to clear out those accounts by searching for userAccountControl=NORMAL_ACCOUNT if pulling from Active Directory via SA-ldapsearch.")')
        launchCheck("toomanyaccounts", "warn", "Validate there aren't more than 10 accounts for a single employeeid", '| stats dc(sAMAccountName) as num by employeeid | sort 0 - num | eval employeeid = employeeid . " (" . num . ")" | stats count as total count(eval(num>=10)) as error list(eval(if(num>=10, employeeid, null))) as user_error | eval status=if(error=0, "ok", "bad"), description=if(error=0, "Check Passed", "UBA works to unify accounts based on the employeeid field. Sometimes employeeid is an actual employee\'s ID in the HR system, but it can be any field that allows us to unify an employee\'s administrative account with their non-administrative account. This check looks for employeeids that are associated with ten or more accounts, which should basically never happen, and may be a sign of errors. Out of " . total . " employees, " . error . " have ten or more accounts. The first few employeeids with too many accounts are: " . mvjoin(mvindex(user_error, 1,10), ", ") . ".")')
        launchCheck("atleastoneadmin", "warn", "Validate that there is at least one admin account defined", '| search hrAccountType=CASE(Admin) | stats count values(sAMAccountName) as admins| eval status=if(count!=0, "ok", "bad"), description=if(count!=0, "Check Passed. We found " . count . " administrative accounts identified in your dataset. The first few usernames are: " . mvjoin(mvindex(admins, 1,10), ", ") . ".", "For most UBA customers, monitoring administrator activity is very important. We did not find any administrators identified in your dataset, though. Assuming that your environment is not very special, you should identify admin accounts via the hrAccountType field. A common approach uses the eval command: |eval hrAccountType= case(like(sAMAccountName,\\"adm_%\\"), \\"Admin\\",like(lower(sAMAccountName),\\"%svc%\\") OR like(lower(sAMAccountName),\\"%service%\\"),\\"Service\\")")')
        launchCheck("atleastoneservice", "warn", "Validate that there is at least one service account defined", '| search hrAccountType=CASE(Service) | stats count values(sAMAccountName) as services| eval status=if(count!=0, "ok", "bad"), description=if(count!=0, "Check Passed. We found " . count . " service accounts identified in your dataset. The first few usernames are: " . mvjoin(mvindex(services, 1,10), ", ") . ".", "For many UBA customers, monitoring service account activity is very important. We did not find any service accounts identified in your dataset, though. Assuming that you wish to monitor service account activity, you should identify services accounts via the hrAccountType field. A common approach uses the eval command: |eval hrAccountType= case(like(sAMAccountName,\\"adm_%\\"), \\"Admin\\",like(lower(sAMAccountName),\\"%svc%\\") OR like(lower(sAMAccountName),\\"%service%\\"),\\"Service\\")")')
        launchCheck("somemultiuseraccounts", "error", "Validate that at least one employeeid has multiple usernames associated", ' | stats dc(sAMAccountName) as num by employeeid |where num>1 | stats count avg(num) as avg min(num) as min max(num) as max | eval avg=round(avg,2)| eval status=if(count!=0, "ok", "bad"), description=if(count!=0, "Check Passed. We found " . count . " employeeids with multiple user accounts associated in your dataset. The average number of accounts was " . avg . ", the minimum (amongst employeeids with more than 1) was " . min . " and the maximum was . " . max . ".", "We were unable to find any employeeids with multiple user accounts. This almost invariably means you have not correctly configured your Identity Data to join together the privileged and non-privileged account for any given admin. That means we would not be able to connect their exploitative privileged actions and their non-privileged exfiltration (or etc.)! The only scenario where this is not an error is if this environment does not use separate admin accounts (rare) or if the only in scope users are not admins.")')
        launchCheck("incorrectuac", "error", "Validate that the UAC or USER_ACCOUNT_CONTROL fields are correctly configured", '| stats count(eval(if(match(UAC, "\d+"), UAC, null))) as inValidUACCount values(eval(if(match(UAC, "\d+"), UAC, null))) as inValidUACs count(UAC) as UACCount count(eval(if(match(uaccode, "\w+"), uaccode, null))) as inValiduaccodecount values(eval(if(match(uaccode, "\w+"), uaccode, null))) as inValiduaccodes count(uaccode) as uaccodecount | eval status=if(inValiduaccodecount + inValidUACCount = 0 AND uaccodecount + UACCount > 0, "ok", "bad"), description=case(inValiduaccodecount + inValidUACCount = 0 AND uaccodecount + UACCount > 0, "Check Passed. UBA expects numeric (bitwise) account controls in a field called uaccode (you have " . uaccodecount . ") and plain text (e.g., NORMAL_ACCOUNT) descriptions in a field called UAC (you have ". UACCount . ").", uaccodecount + UACCount == 0, "Check failed as we did not find any user account control fields defined. This means you do not have any *incorrectly* defined, but most deployments will have them defined. This is only a warning.", inValiduaccodecount + inValidUACCount > 0, "Check failed as we found incorrect elements in the UAC or uaccode fields. UBA expects numeric (bitwise) account controls in a field called uaccode. You have " . uaccodecount . " and " . inValiduaccodecount . " were incorrect" . coalesce(" (examples are: " . mvjoin(mvindex(inValiduaccodes, 0, 10), ", ") .")", "") . ". On the other hand, UBA expects plain text (e.g., NORMAL_ACCOUNT) descriptions in a field called UAC. You have " . UACCount . " and " . inValidUACCount . " were incorrect" . coalesce(" (examples are: " . mvjoin(mvindex(inValidUACs, 0, 10), ", ") .")", "") . ".", 1=1, "unknown error analyzing check..")')
        launchCheck("computerAccounts", "warn", "Validate there are no computer accounts included among the user accounts", '| stats count as total count(eval(match(sAMAccountName, "\\\$\$\$\$"))) as error values(eval(if(match(sAMAccountName, "\\\$\$\$\$"), sAMAccountName, null))) as user_error | eval status=if(error=0, "ok", "bad"), description=if(error=0, "Check Passed", "Your Identity Data is only used for user accounts (be they normal, admin, service, or etc.). We shouldn\'t include computer accounts in this list. In most organizations, only computer accounts end with a dollar sign. This check will validate that there are none. Out of " . total . " accounts, " . error . " seem to be computer accounts. The first few accounts are: " . mvjoin(mvindex(user_error, 1,10), ", ") . ". You may want to clear out those accounts by searching for sAMAccountName!=\\"$*\\".")')

        function launchCheck(name, severity, description, search){
            console.log("Kicking off severity: ", severity)
            console.log("Kicking off description: ", description)
            console.log("Kicking off search: ", search)
            $("#identity_data_individual_checks").append('<tr><td  style=\"width: 350px\">' + description + '</td><td style=\"width: 75px\" class="identity_data_check_status" id="identity_data_check_' + name + '_status"><!-- <img style="width: 20px; height: 20px;" src="/static/app/' + appName + '/icon_processing.gif" title="Processing..." /> --></td><td style=\"width: calc(100% - 450px)\" class="identity_data_check_description" id="identity_data_check_' + name + '_description"></td></tr>')
            window.HRChecks[name] = []
            window.HRChecks[name].search_manager = new PostProcessManager({
                "search": search,
                "managerid": "identity_data_base_search",
                "id": "identity_" + name
            }, {tokens: true, tokenNamespace: "submitted"});
            
               
            window.HRChecks[name].results = window.HRChecks[name].search_manager.data('results', { output_mode:'json', count:0 });
            window.HRChecks[name].search_manager.on('search:done', function(properties) {
                if(window.HRChecks[name].search_manager.attributes.data.resultCount == 0) {
                  $("#identity_data_check_" + name + '_status').html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/err_ico.gif\" title=\"Error\" />")
                  window.generalStatus.identity = "err"
                }       
                window.HRChecks[name].results.on("data", function() {
                    var data = window.HRChecks[name].results.data().results;
                    console.log("Here are my results", window.HRChecks[name].search_manager, data)
                    if(data[0].status == "bad"){
                        if(severity=="error"){
                            $("#identity_data_check_" + name + '_status').html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/err_ico.gif\" title=\"Error\" />")
                            window.generalStatus.identity = "err"
                        }else{
                            $("#identity_data_check_" + name + '_status').html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/warn_ico.gif\" title=\"Warning\" />")
                            if(window.generalStatus.identity == "ok")
                                window.generalStatus.identity = "warn"
                            
                        }
                        
                        $("#identity_data_check_" + name + '_description').html("<p>" + data[0].description + "</p>")
                    }else{
                        $("#identity_data_check_" + name + '_status').html("<img style=\"width: 20px; height: 20px;\" src=\"/static/app/" + appName + "/ok_ico.gif\" title=\"Got Results\" />")
                        $("#identity_data_check_" + name + '_description').html("<p>" + data[0].description + "</p>")
                    }
                    
                });
                checkOverallData()
              });

        }


});