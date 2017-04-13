"use strict";

require([
    "jquery",
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "splunkjs/mvc/simplexml",
    "splunkjs/ready!",
    "bootstrap.tooltip",
    "bootstrap.popover"//,
    
    ],
    function(
        $,
        mvc,
        utils,
        TokenUtils,
        DashboardController,
        Ready
        ) {
    var appName = utils.getCurrentApp()


            var unsubmittedTokens = mvc.Components.getInstance('default');
            var submittedTokens = mvc.Components.getInstance('submitted');
            mvc.Components.getInstance("vsearch_bar").on("change", function(props){
                console.log("I just changed something", props)

                var unsubmittedTokens = mvc.Components.getInstance('default');
                var submittedTokens = mvc.Components.getInstance('submitted');
                if(props.indexOf("inputlookup") > 0 && props.indexOf("inputlookup") < 10){
                    unsubmittedTokens.set("search_or_lookup", "")
                }else{
                    unsubmittedTokens.set("search_or_lookup", "search")
                }
                submittedTokens.set(unsubmittedTokens.toJSON());
            })
            //var myDataset = unsubmittedTokens.get("ml_toolkit.dataset")
            //unsubmittedTokens.set(myDataset.replace(/\W/g,""),"Test");
            splunkjs.mvc.Components.getInstance($(".input-dropdown:contains(Target datamodel)").attr("id")).on("change", function(props){
                console.log("I just changed something", props)

                var unsubmittedTokens = mvc.Components.getInstance('default');
                var submittedTokens = mvc.Components.getInstance('submitted');
                if(props.indexOf("UBA_") == 0 ){
                    unsubmittedTokens.set("UBA", props)
                    unsubmittedTokens.unset("CIM")
                }else{
                    unsubmittedTokens.unset("UBA")
                    unsubmittedTokens.set("CIM", props)
                }
                submittedTokens.set(unsubmittedTokens.toJSON());
            })
            
    //if($(".dvTooltip").length>0){$(".dvTooltip").tooltip()}
    //if($(".dvPopover").length>0){$(".dvPopover").popover()}
    
        }
    );

