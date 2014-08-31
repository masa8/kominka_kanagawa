var nskana = (function() {

  var kominka = null;
  var kominkaMarkers = {};
  var map = null;
  var selected = "";
  var largemap = true;

  function buildKominkaList() {
        for ( i in kominka.lists ){
          $("#kominka_list").append('<li><a href="index.html">' + kominka.lists[i].title + '</a></li>');
        }
        $("#kominka_list").listview().listview('refresh');
          $(document).on("click", "#kominka_list li", function(event) {
           selected = $(this).text();
           $("#kominkapanel").panel("close");
        });
  }
  function getKominkaDefaultData() {
      $.ajax({
       url: 'kominka.json',
       async: false,
       dataType: 'json'
      }).success(function(data) {
      console.log('kominka.json read  successuly!');
       kominka = data;
      }).error(function(data,text,err) {
       console.log('kominka.json read error!: ' + text);
      });
  }
 var w = new $.Deferred;
  function setKominkaData() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT,
        0,
        gotFS,
        function(evt) { console.log('E gotFS'); w.reject('E'); });
    return w.promise();
  }
  function gotFS(fileSystem) {
    console.log('gotFS!');
    fileSystem.root.getFile('my_kominka.json',
        { create: true, exclusive: false },
        gotFileEntry,
        function(evt) { w.reject('E'); });
  }
  function gotFileEntry(fileEntry) {
    console.log('gotFileEntry!!');
    fileEntry.createWriter(gotFileWriter,
        function(evt) { 
          console.log("E gotFileWriter");
          w.reject('E'); 
        });
  }
  function gotFileWriter(writer) {
    var string = JSON.stringify(kominka);
    writer.onwriteend = function(evt) {
      console.log('OnTruncated!!');
      writer.seek(0);
      writer.onwriteend = function(evt) {
        console.log('OnWriteEnd!!');
        w.resolve();  
      };
      writer.write(string);
      w.resolve();
    };
    writer.onerror = function(evt) {
      console.log('OnError!');
      w.reject('E');
    };
    writer.onabort = function(evt) {
      console.log('OnAbort');
      w.reject('E');
    };  
    writer.onwrite = function(evt) {
      console.log('OnWrite!');
    };
    writer.truncate(0);
    console.log('my_kominka.json was written!!');
  }
 var d = new $.Deferred;
  function getKominkaData() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
    checkData,
    function(evt) {
        console.log('E checkData!');
        d.reject('E');
    });
    return d.promise();
  }

  function checkData(fileSystem) {
    console.log('checkData!');

    var reader = fileSystem.root.createReader();
    reader.readEntries(function(entries){
      var i;
      for ( i = 0; i< entries.length; i++){
      //  alert(entries[i].toURL());
      }
    },function(){ });
    fileSystem.root.getFile('my_kominka.json',
        { create: false, exclusive: false },
        checkSavedFileEntry,
        function(evt) {
          console.log('E checkSavedFileEntry!');
          console.log("my_kominka doesn't exists!");
          d.reject('E');
        });
  }

  function checkSavedFileEntry(fileEntry) {
    console.log('checkMyFileEntry!!');
    fileEntry.file(checkFile,
        function(evt) {
          console.log('E checkFile!');
          d.reject('E');
        });
  }

  function checkFile(file) {
    console.log('checkFile!');
    //if (file.Type ) {
      //alert(file.Type);
      var checker = new FileReader();
      checker.onerror = function(evt) {
        console.log('onError!');
        d.reject('E'); };
      checker.onabort = function(evt) {
        console.log('onAbort!');
        d.reject('E'); };
      checker.onloadstart = function(evt) {
        console.log('onStart!'); };
      checker.onloadend = function(evt) {
        console.log('OnLoadEnd!');
        if (evt.target.result == null) {
          console.log("my_kominka file content doesn't exists!");
          d.reject('E');
        }else {
          console.log('MY_KOMINKA file exists!');
          kominka = JSON.parse(evt.target.result);
          d.resolve();
        }
      };
      checker.readAsText(file);
      console.log('my_kominka file was read as Text!!');
    //}else {
      //console.log('my_kominka file is not file!');
      //d.reject('E');
    //}
  }
  function createMap() {
    

    var KANAGAWA = new plugin.google.maps.LatLng(
        kominka.map.center.lat, kominka.map.center.lng);


    var map_button = document.getElementById('map-button');
    map_button.addEventListener('click', onMapBtnClicked, false);
    
    //var large_map_button = document.getElementById('large-map-button');
    //large_map_button.addEventListener('click', onLargeMapBtnClicked, false);

    var div = document.getElementById('map_canvas');
    map = plugin.google.maps.Map.getMap(div,
        {'controls': { 'myLocationButton': true },
      'camera': {'latLng': KANAGAWA, 'zoom': kominka.map.zoomlevel }});
      
      map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
      
      $("#kominkapanel").on('panelbeforeopen',function(){ 
        map.setVisible(false);

      });
      $("#kominkapanel").on('panelclose',function(){ 
      
         map.setVisible(true); 
         kominkaMarkers[selected].showInfoWindow();

          for (k in kominka.lists) {
            if (selected == kominka.lists[k].title) {
              $('#kominka-name').text(kominka.lists[k].name);
              $('#kominka-description').text(kominka.lists[k].description);
              $('#kominka-howtogetthere').text(kominka.lists[k].howtogetthere);
              $('#kominka-check').checkboxradio('enable');
              if (kominka.lists[k].status == 'checked') {
                $('#kominka-check').prop("checked",true).checkboxradio("refresh");
              }else {
                $('#kominka-check').prop("checked",false).checkboxradio("refresh");
              }
              $('#kominka-image').attr("src",kominka.lists[k].image);
            }
          }
      
      });
      
     
        var divmap = document.getElementById('map_canvas');
        divmap.style.backgroundColor = 'lightgray';
      
        buildKominkaList();



  } 
  
  
  
  var n = new $.Deferred;
  function doNothing() {
    console.log('doNothing');
    n.resolve();
    return n.promise();
  }
  function onMapReady(map) {
    for (i in kominka.lists) {
      var motto_manabitai_basyo = new plugin.google.maps.LatLng(
          kominka.lists[i].position.lat, kominka.lists[i].position.lng);
      var opts = {};
      opts['position'] = motto_manabitai_basyo;
      opts['title'] = kominka.lists[i].title;
      opts['snippet'] = kominka.lists[i].name;
      if (kominka.lists[i].status == 'checked') {
        opts['icon'] = 'www/res/icons/green.png';
      }else {
        opts['icon'] = 'www/res/icons/red.png';
      }
      map.addMarker(opts, function(marker) {
        kominkaMarkers[marker.getTitle()] = marker;
        marker.addEventListener(
          plugin.google.maps.event.MARKER_CLICK, function() {
          $('#kominka-name').text("");
          $('#kominka-description').text("");
          $('#kominka-howtogetthere').text("");
          $('#kominka-check').checkboxradio('disable');
          $('#kominka-check').checkboxradio('refresh');
          $('#kominka-image').attr("src","res/default.png");
          marker.showInfoWindow();
                
        });
        marker.addEventListener(
          plugin.google.maps.event.INFO_CLICK, function() {
          for (k in kominka.lists) {
            if (marker.getTitle() == kominka.lists[k].title) {
              $('#kominka-name').text(kominka.lists[k].name);
              $('#kominka-description').text(kominka.lists[k].description);
              $('#kominka-howtogetthere').text(kominka.lists[k].howtogetthere);

              $('#kominka-check').checkboxradio('enable');
              if (kominka.lists[k].status == 'checked') {
                $('#kominka-check').prop("checked",true).checkboxradio('refresh');
              }else{
                $('#kominka-check').prop("checked",false).checkboxradio('refresh');
              }
                $('#kominka-image').attr("src",kominka.lists[k].image);
            }
          }
        });
      });
    }
    var contentheight = $(window).height() - $('#map-header').height() - $('#map-footer').height();
   divmap.style.height = contentheight / 2 + 'px';
   map.refreshLayout();
   
  }
   function onMapBtnClicked() {
    
    if ( largemap ) {
        var divmap = document.getElementById('map_canvas');
        var contentheight = $(window).height() - $('#map-header').height() - $('#map-footer').height();
        divmap.style.height = contentheight + 'px';
        map.refreshLayout();
        largemap = false;
        $("#map-button").text("小さな地図").button('refresh');
    }else{
        var divmap = document.getElementById('map_canvas');
        var contentheight = $(window).height() - $('#map-header').height() - $('#map-footer').height();
        divmap.style.height = contentheight / 2 + 'px';
        map.refreshLayout();
        largemap = true;
        $("#map-button").text("大きな地図").button('refresh');
    }
  }
  function onFlipDisabled() {
    $('#kominka-check').checkboxradio('disable');
  }
  function onFlipChanged() {
    $('#kominka-check').on('change', function(evt) {
      var val = $('#kominka-check').prop("checked");
      var name = $('#kominka-name').text();
      if (val == true) {
        for (i in kominka.lists) {
          if (kominka.lists[i].name == name) {
            kominka.lists[i].status = 'checked';
            var marker = kominkaMarkers[kominka.lists[i].title];
            if (marker != null) {
              console.log('green!');
              marker.remove();
              var motto_manabitai_basyo = new plugin.google.maps.LatLng(
                kominka.lists[i].position.lat,
                kominka.lists[i].position.lng);
              var opts = {};
              opts['position'] = motto_manabitai_basyo;
              opts['title'] = kominka.lists[i].title;
              opts['snippet'] = kominka.lists[i].name;
              if (kominka.lists[i].status == 'checked') {
                opts['icon'] =
                  'www/res/icons/green.png';
              }else {
                opts['icon'] =
                  'www/res/icons/red.png';
              }
              map.addMarker(opts, function(marker) {
                kominkaMarkers[marker.getTitle()] = marker;
                marker.addEventListener(
                  plugin.google.maps.event.MARKER_CLICK, function() {
                  $('#kominka-name').text("");
                  $('#kominka-description').text("");
                  $('#kominka-howtogetthere').text("");
                  $('#kominka-check').checkboxradio('disable');
                  $('#kominka-check').checkboxradio('refresh');
                  $('#kominka-image').attr("src","res/default.png");
                  marker.showInfoWindow();
                });
                marker.addEventListener(
                  plugin.google.maps.event.INFO_CLICK, function() {
                  for (k in kominka.lists) {
                    if (marker.getTitle() == kominka.lists[k].title) {
                      $('#kominka-name').text(kominka.lists[k].name);
                      $('#kominka-description').text(
                        kominka.lists[k].description);
                      $('#kominka-howtogetthere').text(
                        kominka.lists[k].howtogetthere);
                      $('#kominka-check').checkboxradio('enable');
                      if (kominka.lists[k].status == 'checked') {
                        $('#kominka-check').prop("checked",true).checkboxradio('refresh');
                      }else{
                        $('#kominka-check').prop("checked",false).checkboxradio('refresh');
                      }
                      $('#kominka-image').attr("src",kominka.lists[k].image);
                    }
                  }
                });
              });
              console.log('greened!');
            }
          }
        }
      }else{
        for (i in kominka.lists) {
          if (kominka.lists[i].name == name) {
            kominka.lists[i].status = 'unchecked';
            var marker = kominkaMarkers[kominka.lists[i].title];
            if (marker != null) {
              console.log('red!');
              marker.remove();
              var motto_manabitai_basyo = new plugin.google.maps.LatLng(
                  kominka.lists[i].position.lat,
                  kominka.lists[i].position.lng);
              var opts = {};
              opts['position'] = motto_manabitai_basyo;
              opts['title'] = kominka.lists[i].title;
              opts['snippet'] = kominka.lists[i].name;
              if (kominka.lists[i].status == 'checked') {
                opts['icon'] =
                  'www/res/icons/green.png';
              }else {
                opts['icon'] =
                  'www/res/icons/red.png';
              }
              map.addMarker(opts, function(marker) {
                kominkaMarkers[marker.getTitle()] = marker;
                marker.addEventListener(
                  plugin.google.maps.event.MARKER_CLICK, function() {
                  marker.showInfoWindow();
                });
                marker.addEventListener(
                  plugin.google.maps.event.INFO_CLICK, function() {
                  for (k in kominka.lists) {
                    if (marker.getTitle() == kominka.lists[k].title) {
                      $('#kominka-name').text(kominka.lists[k].name);
                      $('#kominka-description').text(
                        kominka.lists[k].description);
                      $('#kominka-howtogetthere').text(
                        kominka.lists[k].howtogetthere);
                      $('#kominka-check').checkboxradio('enable');
                      if (kominka.lists[k].status == 'checked') {
                        $('#kominka-check').prop("checked",true).checkboxradio('refresh');
                      }else{
                        $('#kominka-check').prop("checked",false).checkboxradio('refresh');
                      }
                      $('#kominka-image').attr("src",kominka.lists[k].image);
                    }
                  }
                });
              });
              console.log('reded!');
            }
          }
        }
      }
      setKominkaData();
    });
  }


function Api() {
}
Api.prototype.go = function() {
  
  
  getKominkaDefaultData();
  getKominkaData()
  .then(createMap,createMap)
  .then(onFlipDisabled())
  .then(onFlipChanged());
};
var kana = {
  test: 'test!!!',
    create: function() {
          return new Api();
        }
  };

  return kana;

})();
