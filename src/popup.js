
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37104103-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

$(function(){
    var oPathControl = $('#J-filePathControl');
    var oFilePathInput = $('#J-filePathInput');
    var oFilePathText = $('#J-filePathText');
    var oOutputPath = $('#J-outputPath');
    var oOutputPathInput = $('#J-outputPathInput');
    var oContent = $('#J-content');

    function beforeAddImg(){
        oContent.html('Ctrl + V to add Image')
    }

    if (localStorage['filePath']) {
        oFilePathInput.val(localStorage['filePath']);
        oFilePathText.html(localStorage['filePath'])
        oPathControl.addClass('unedit');
        beforeAddImg();
    } else {
        oFilePathInput.val('');
        oPathControl.removeClass('unedit');
    }

    // save download path 
    oFilePathInput.blur(function(){
        if(this.value === '') {
            localStorage['filePath'] = '';
            oContent.html('');
            return;
        }

        /\/$/.test(this.value) || (this.value += '/');

        localStorage['filePath'] = this.value;
        oFilePathText.html(this.value);
        oPathControl.addClass('unedit');
        beforeAddImg();
    })

    // edit download path
    oFilePathText.click(function(){
        oPathControl.removeClass('unedit');
        oFilePathInput.focus();
    })

    document.onpaste = function(e){

        if (!localStorage['filePath']) {return;}

        oContent.html('');

        var items = e.clipboardData.items;
        var oImg = $('#_img');
        var oLink = $('#_link');
        var rand = (new Date()).getTime();
        var blob, reader;

        console.log(JSON.stringify(items)); // the mime types

        if (items[0].type == 'image/png') {

            oLink = oLink.length > 0 ?
                oLink :
                $('<a>').attr('id', '_link').attr('download', rand + '.png').appendTo(oContent);
            oImg = oImg.length > 0 ?
                oImg :
                $('<img>').attr('id', '_img').appendTo(oLink);

            blob = items[0].getAsFile();
            reader = new FileReader();

            reader.onload = function(e){
                console.log(e.target.result)
                oImg.attr('src', e.target.result);
                oLink.attr('href', e.target.result);

                var f = new FormData();

                if(false){

                    /******** download img **********/
                    setTimeout(function(){
                        oLink[0].click();
                    }, 200)

                    oOutputPath.removeClass('hide');

                    // copy markdown img reference to clipboard
                    oOutputPathInput.val('![](' + localStorage['filePath'] + rand + '.png' + ')');
                    oOutputPathInput.focus();
                    oOutputPathInput.select();
                    document.execCommand('copy');
                } else {

                    /********* upload img *************/
                    f.append('file', blob);
                    f.append('username', 'noahua');
                    f.append('password','06adbe19c46f696eeabcc0825977f2c6');
                    f.append('type','json');

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'http://markimage.duapp.com/do.php?action=htmlupload', true);
                    xhr.onreadystatechange = function(){
                        if(xhr.readyState === 4) {

                            // success
                            if(xhr.status === 200) {
                                console.log('success');
                                var rsp = JSON.parse(xhr.responseText);

                                oOutputPath.removeClass('hide');

                                // copy img reference to clipboard
                                // oOutputPathInput.val('![](' + rsp.info.url  + ')');
                                oOutputPathInput.val(rsp.info.url);
                                oOutputPathInput.focus();
                                oOutputPathInput.select();
                                document.execCommand('copy');

                            } else {

                                // error
                                console.log('error')

                            }
                        }

                    }

                    // Progress Bar：<progress min="0" max="100" value="0">0% complete</progress>
                    // var progress = $(progress)
                    xhr.upload.onprogress = function(e){
                        if(e.lengthComputable) {
                            console.log(e.loaded / e.total)
                            // progress.val( (e.loaded / e.total) * 100 );
                        }

                    }

                    xhr.send(f);

                }

            };

            reader.readAsDataURL(blob);

        } else {
            if (e.target.tagName != 'INPUT') {
                oContent.html('Clipboard content type is ' + items[0].type);
            }
        }
    }
})