var dev = true;

function injectDom(){
    var oInput = $('<input type="text" id="J-noahlu-input" value="" placeholder="">')
    var oBtn = $('<a href="" target="_blank" class="minibutton dark-grey" id="J-noahlu-btn" >History</a>')
    var oContainer = document.querySelectorAll('.container')[1];

    oInput.css({
        marginTop: '10px',
        marginRight: '10px',
        width: '90%',
        padding: '5px 10px'
    })
    .attr('placeholder', 'Click here and paste your image. (Ctrl/Cmd + V)');

    oBtn.css({
        marginTop: '10px'
    })

    dev ?  
        oBtn.attr('href', 'chrome-extension://gonjpgblmfoejljhefjmhefdpblmcaen/history.htm') : 
        oBtn.attr('href', 'chrome-extension://hpbancfjplieholghonkiopcmhlplnfh/history.htm');


    oInput.appendTo(oContainer);
    oBtn.appendTo(oContainer);
}

function injectScript(script){
    var oScript = $('<script></script>');

    oScript.html('(' + script + ')()');
    oScript.appendTo($('head'));
}

function funcWrapper(){

    var oInput = $('#J-noahlu-input');
    var oImgBlob;

    oInput.on('paste', function(e){
        var items = e.originalEvent.clipboardData.items;
        if(items[0].type == 'image/png') {
            console.log(oImgBlob);

            oImgBlob = items[0].getAsFile();
            oInput.val('Starting Upload...');
            oInputUpload();
        }

        console.log(items)
    });

    function oInputUpload() {

        // $.ajax compress request message unexpectly, here we use xhr.
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://github.com/upload/policies/asset', true);
        xhr.onreadystatechange = function(){

            if(xhr.readyState === 4) {

                if(xhr.status >= 200 && xhr.status <300) {
                    console.log('success');
                    var rsp = JSON.parse(xhr.responseText);

                    // upload image to aws
                    awsUpload(rsp);

                } else {
                    console.log('Error!')
                }
            }
        }

        xhr.setRequestHeader('X-CSRF-Token', document.querySelector('meta[name="csrf-token"]').content);

        var f = new FormData();
        f.append('name',(new Date()).getTime() + '.png');
        f.append('size',oImgBlob.size);
        f.append('content_type', 'image/png');
        f.append('team_id','');

        xhr.send(f);
    }

    function awsUpload(awsProp){
        var xhr = new XMLHttpRequest();
        var imgUrl = awsProp.asset.href;
        var f = new FormData();

        xhr.open('POST', awsProp.upload_url);

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4) {
                if(xhr.status >= 200 &&  xhr.status < 300 ) {
                    console.log('upload success')
                    oInput.val(imgUrl ? imgUrl : 'Sorry, Upload Error Occured~');
                    pushImageList(imgUrl);

                }
            }
        }

        // show upload progress
        xhr.upload.onprogress = function(e){
            if(e.lengthComputable) {
                oInput.val('Progress: ' + (e.loaded / e.total).toFixed(2) * 100 + '%');
                if (e.loaded == e.total) {
                    oInput.val('Generating Image Url...');
                }
            }
        }

        // push upload messages body into Form Object
        for (var key in awsProp.form){
            f.append(key, awsProp.form[key]);
        }
        f.append('file', oImgBlob);

        xhr.send(f);
    }

    function pushImageList(imageurl){
        chrome.extension.sendMessage({info: 'getLocalStorage'}, function(msg){
            if(!msg['imageList']) {
                msg['imageList'] = JSON.stringify({images:[]});
            }

            var list = JSON.parse(msg['imageList']);
            list.images.push(imageurl);

            while(list.images.length > 10) {
                list.image.pop();
            }

            chrome.extension.sendMessage({key: 'imageList', val: JSON.stringify(list)}, function(rsp){
                console.log('extension response:' + rsp.info)
            })

        })

    }

    console.log('[githubupload script injected]')
}

injectDom();

// funcWrapper has used chrome.extension api, cannt be injected into page!
// injectScript(funcWrapper.toString());
funcWrapper();
