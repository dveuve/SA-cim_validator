
require([ "splunkjs/mvc/simpleform/formutils", "splunkjs/mvc/simpleform/input/text", 'splunkjs/mvc/simplexml/ready!'],
    function( FormUtils, TextInput){        
        $("#data_inputs").append($("<div>", {id: "data_input", "class": "data_input"}).html('<div class="fieldset"> <div class="input input-text" id="vsearch_bar"> <label>Search:</label> </div> </div>'));
        var vsearch_bar = new TextInput({
            "id": "vsearch_bar",
            "value": "$form.cim_search$",
            "default": "",
            "el": $('#vsearch_bar')
        }, {tokens: true}).render();

        vsearch_bar.on("change", function(newValue) {
            FormUtils.handleValueChange(vsearch_bar);
        });

    
});