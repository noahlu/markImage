function injectDom(){
    var oInput = $('<input type="text" id="J-noahlu-input" value="" placeholder="Paste Your Image Here. (Ctrl/Cmd + V)">')
    var oBtn = $('<a href="" target="_blank" class="minibutton dark-grey" id="J-noahlu-btn" >图片历史</a>')
    var oContainer = document.querySelectorAll('.container')[1];

    oInput.css({
        marginTop: '10px',
        marginRight: '10px',
        width: '80%',
        padding: '5px'
    });

    oBtn.css({
        marginTop: '10px'
    })

    var dev = true;
    dev ?  
        oBtn.attr('href', 'chrome-extension://gonjpgblmfoejljhefjmhefdpblmcaen/history.htm') : 
        oBtn.attr('href', 'chrome-extension://hpbancfjplieholghonkiopcmhlplnfh/history.htm');


    oInput.appendTo(oContainer);
    oBtn.appendTo(oContainer);

    return oInput;
}

function injectScript(script){
    var oScript = $('<script></script>');

    oScript.html('(' + script + ')()');
    oScript.appendTo($(document.head));
}

function funcToInject(){

    var oInput = document.getElementById('J-noahlu-input');
    var oImgBlob;

    oInput.onpaste = function(e){
        var items = e.clipboardData.items;
        if(items[0].type == 'image/png') {
            console.log(oImgBlob);

            oImgBlob = items[0].getAsFile();
            oInput.value = '图片准备上传';
            oInputUpload();
        }

        console.log(items)
    };

    function oInputUpload() {

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://github.com/upload/policies/asset', true);
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4) {

                if(xhr.status >= 200 && xhr.status <300) {
                    console.log('success');
                    var rsp = JSON.parse(xhr.responseText);
                    var imgUrl = rsp.asset.href;

                    // upload to aws
                    var xhr_aws = new XMLHttpRequest();
                    xhr_aws.open('POST', rsp.upload_url);

                    xhr_aws.onreadystatechange = function() {
                        if(xhr_aws.readyState === 4) {
                            if(xhr_aws.status >= 200 &&  xhr_aws.status < 300 ) {
                                console.log('upload success')
                                oInput.value = imgUrl ? imgUrl : '上传出错拉！';
                                pushImageList(imgUrl);

                            }
                        }
                    }

                    xhr_aws.upload.onprogress = function(e){
                        if(e.lengthComputable) {
                            oInput.value = '进度：' + (e.loaded / e.total).toFixed(2) * 100 + '%';
                            if (e.loaded == e.total) {
                                oInput.value = '正在生成图片地址...';
                            }
                        }
                    }

                    var f = new FormData();
                    for (var key in rsp.form){
                        f.append(key, rsp.form[key]);
                    }
                    f.append('file', oImgBlob);

                    xhr_aws.send(f);

                } else {
                    console.log('error')
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
funcToInject(); // 用到chrome.extension接口，不能注入到页面
// injectScript(funcToInject.toString());

// console.log('MarkImage is in.');