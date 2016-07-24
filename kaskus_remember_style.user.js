// ==UserScript==
// @name            Kaskus Remember Style
// @description     Remember styles being set in kaskus, eg. font-size. Style will also apply to KQR preview dialog.
// @author          idx
// @namespace       github.com/idoenk/kaskus-remember-style
// @homepageURL     https://github.com/idoenk/kaskus-remember-style
// @require         https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @include         /^https?://www.kaskus.co.id/thread/*/
// @include         /^https?://www.kaskus.co.id/lastpost/*/
// @include         /^https?://www.kaskus.co.id/post/*/
// @include         /^https?://www.kaskus.co.id/show_post/*/
// @include         /^https?://www.kaskus.co.id/group/discussion/*/
// @include         /^https?://fjb.kaskus.co.id/(thread|product|post)\b/*/
// @version         0.1
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_log
// @timestamp       1469364674913
// @license         (CC) by-nc-sa 3.0
// @run-at          document-end
// ==/UserScript==
/**
* 
window.alert(new Date().getTime());
*
*/
(function() {
var gvar = function(){},
    OPTIONS_BOX = {
      KEY_SAVE_FONTSIZE     : [null]
    },
    KEY_SAVE = 'KEY_SAVE_',
    GMSTORAGE_PATH  = 'GM_'
;
gvar.__DEBUG__ = !1;
gvar.default_fontsize = 14;

function GM_addGlobalStyle(a, b, c) {
  var d, e;
  if (a.match(/^https?:\/\/.+/)) {
    d = createEl("link", { type: "text/css", rel:'stylesheet', href:a });
  }else{
    d = createEl("style", { type: "text/css" });
    d.appendChild(createTextEl(a));
  }
  if (isDefined(b) && isString(b)) d.setAttribute("id", b);
  if (isDefined(c) && c) {
    document.body.insertBefore(d, document.body.firstChild)
  } else {
    e = document.getElementsByTagName("head");
    if (isDefined(e[0]) && e[0].nodeName == "HEAD") setTimeout(function () {
      e[0].appendChild(d)
    }, 100);
    else document.body.insertBefore(d, document.body.firstChild)
  }
  return d
}
function getValue(key, cb) {
  var ret, data = OPTIONS_BOX[key];
  if( !data ) return;
  setTimeout(function(){
    ret = GM_getValue(key,data[0]);
    if(typeof(cb)=='function')
      cb(ret);
    else if(cb)
      cb = ret;
    else
      return ret;
  }, 0);
}
function setValue(key, value, cb) {
  var ret, data = OPTIONS_BOX[key];
  if( !data ) return;
  setTimeout(function(){
    try{
      ret = GM_setValue(key,value)
      if(typeof(cb)=='function')
        cb(ret);
      else if(cb)
        cb = ret;
      else
        return ret;
    }catch(e){ clog(e.message) }
  }, 0);
}
function createTextEl(a) {
  return document.createTextNode(a)
}
function createEl(a, b, c) {
  var d = document.createElement(a);
  for (var e in b) if (b.hasOwnProperty(e)) d.setAttribute(e, b[e]);
  if (c) d.innerHTML = c;
  return d
}

//=== mini-functions
// static routine
function isDefined(x)   { return !(x == null && x !== null); }
function isUndefined(x) { return x == null && x !== null; }
function isString(x) { return (typeof(x)!='object' && typeof(x)!='function'); }

// ----my ge-debug--------
function show_alert(msg, force) {
  if(arguments.callee.counter) { arguments.callee.counter++; } else { arguments.callee.counter=1; }
  GM_log( ["string", "number"].indexOf(typeof msg) !== -1 ? '('+arguments.callee.counter+') '+msg : msg );

  if(force==0) { return; }
}
function clog(msg) {
  if( !gvar.__DEBUG__ ) return;
  var isPlain = (["string", "number"].indexOf(typeof msg) !== -1);
  var msgStr = (isPlain ? '[dbg] '+msg : msg);
  if( !isPlain )
    show_alert('[dbg] '+typeof msg);

  show_alert(msgStr);
}



!function main(){

  var fontsize = null,
      $areset  = null,
      $parent  = $(".accessibility.tools-panel"),
      setFontStyle  = function(fsize){
        var css, defsize;

        if( !fsize ){
          $('#krs-dynamic-css').length &&
            $('#krs-dynamic-css').text('');

          defsize = gvar.default_fontsize||14,
            ($(".entry").css("font-size", defsize), $(".post-quote").children("span").css("font-size", defsize));
          return !1;
        }

        css = ''
          +'.entry, .post-quote span, :root .kqr-dialog-base #box_wrap .entry-content, :root .kqr-dialog-base #box_wrap .entry-content .post-quote span{font-size: '+fsize+'px!important;}'
        ;
        if( !$('#krs-dynamic-css').length )
          GM_addGlobalStyle(css, 'krs-dynamic-css');
        else
          $('#krs-dynamic-css').html( css );
      }
  ;


  if( $parent.length ){
    $parent.find('a[class*=text-size-]').each(function(){
      $(this).click(function(e){
        var $me = $(this),
            currentSize = parseInt($(".entry").css("font-size")),
            mode = (function(theclass){
              var cucok = null;
              if(cucok = /\btext-size-(\w+)/i.exec(theclass) )
                cucok = cucok[1];
              return cucok;
            })($me.attr('class'))
        ;

        if( mode && (mode == 'increase' ? currentSize < 32 : currentSize > 10) ) {
          currentSize = currentSize + ( mode == 'increase' ? 1 : -1);

          setValue(KEY_SAVE + 'FONTSIZE', currentSize, function(){

            setFontStyle( currentSize );
            $parent.find('#btn_reset_fontsize').css('visibility', 'visible');
          }), ($(".entry").css("font-size", currentSize), $(".post-quote").children("span").css("font-size", currentSize));

        }
        e.preventDefault();
        return !1;
      });
    });
    $areset = $('<a id="btn_reset_fontsize" href="javascript:;" title="Reset font size" style="text-indent:0; background: none; font-size: 2em; text-align: center; width: 32px; color: #888;"><i class="fa fa-times-circle-o"></i></a>');
    $areset.click(function(){
      setValue(KEY_SAVE + 'FONTSIZE', null);
      setFontStyle('');
      $(this).css('visibility', 'hidden');
    });
    $parent.append( $areset );
  }
  // .accessibility

  // preload saved-state
  getValue(KEY_SAVE + 'FONTSIZE', function(storedFontSize){
    storedFontSize = parseInt(storedFontSize) || null;
    if( !storedFontSize || isNaN(storedFontSize) ) {
      $parent.find('#btn_reset_fontsize').css('visibility', 'hidden');
      return !1;
    }
    else{
      if( storedFontSize <= 32 && storedFontSize >= 10 )
        setFontStyle( storedFontSize );
    }
  });
}();
})();
/* eof. */
