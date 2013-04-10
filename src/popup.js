var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37104103-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

$(function(){
    var oOutputPath = $('#J-outputPath');
    var oOutputPathInput = $('#J-outputPathInput');
    var oContent = $('#J-content');

    function pasteHandler(e){
        var items = e.clipboardData.items;
        var oImg = $('#_img');
        var oLink = $('#_link');
        var timestamp = (new Date()).getTime();
        var blob, reader;

        // console.log(JSON.stringify(items)); // the mime types
        oContent.html('');

        if (items[0].type == 'image/png') {

            oLink = oLink.length > 0 ? oLink :
                    $('<a>')
                        .attr('id', '_link')
                        .attr('download', 'screenshot' + timestamp + '.png')
                        .appendTo(oContent);

            oImg = oImg.length > 0 ? oImg :
                   $('<img>')
                        .attr('id', '_img')
                        .appendTo(oLink);

            // Upload image
            blob = items[0].getAsFile();
            uploadImage(blob);

            // Display image
            reader = new FileReader();
            reader.onload = function(e){
                console.log(e.target.result)

                oImg.attr('src', e.target.result);
                oLink.attr('href', e.target.result);
            }
            reader.readAsDataURL(blob);

        } else { // Not image in the Clipboard 
            oContent.html('Upload Failed! Clipboard content is ' + items[0].type);
        }
    }

    function uploadImage(blob){
        var f = new FormData();

        f.append('file', blob);
        f.append('username', 'noahua');
        f.append('password','06adbe19c46f696eeabcc0825977f2c6');
        f.append('type','json');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://markimage.duapp.com/do.php?action=htmlupload', true);

        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4) {
                if(xhr.status >= 200 && xhr.status < 300) {
                    var rsp = JSON.parse(xhr.responseText);
                    oOutputPath.removeClass('hide');
                    oOutputPathInput.val(rsp.info.url);

                    // Copy image url to clipboard
                    // oOutputPathInput.focus();
                    // oOutputPathInput.select();
                    // document.execCommand('copy');
                } else {
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

    document.onpaste = pasteHandler;
})