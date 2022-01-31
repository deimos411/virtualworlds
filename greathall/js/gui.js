// GUI for mobile navigation

let gui = {   
    
    isMobile:false,    
    resize(canvas){},
    init(){}
}

gui.init = function(){

    let _this = gui;
   
    // check if mobile navigation
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        // true for mobile device
        _this.isMobile = true;
        //console.log('gui mobile device')
      }else{
        // false for not mobile device
        _this.isMobile = false;
        //console.log('gui not mobile device')
    }	

}
gui.resize = function(canvas){
    
    let _this = gui;
    
    // screen mode
    const PORTRAIT = 1;
    const LANDSCAPE = 2;

    //console.log('gui canvas width : ' + canvas.width);
	//console.log('gui canvas height : ' + canvas.height);  
    //console.log('fullscreen?' + document.fullscreenElement);

    if( canvas.height >=  canvas.width){
        screenMode = PORTRAIT;
    } else {
        screenMode = LANDSCAPE;
    }

    // only resize on mobile
    if(_this.isMobile){

        // on portrait mode without fullscreen
        if(!document.fullscreenElement && screenMode == PORTRAIT ){           
            
            document.getElementById('fps').style.width = '120px';
            document.getElementById('fps').style.top = '15px';
            document.getElementById('fps').style.left = '10px';
            document.getElementById('fps').style.fontSize = '32px';
            document.getElementById('btnNavigation').style.width = '96px';            
            document.getElementById('btnNavigation').style.height = '96px';
            document.getElementById('btnNavigation').style.top = '55px';
            document.getElementById('btnCamera').style.width = '96px';
            document.getElementById('btnCamera').style.height = '96px';
            document.getElementById('btnCamera').style.top = '175px';          
            document.getElementById('btnFullScreen').style.width = '96px';
            document.getElementById('btnFullScreen').style.height = '96px';
            document.getElementById('btnFullScreen').style.top = '295px';

            
        } else {
            // otherwise 
            document.getElementById('fps').style.width = '60px';
            document.getElementById('fps').style.top = '15px';
            document.getElementById('fps').style.left = '10px';
            document.getElementById('fps').style.fontSize = '16px';
            document.getElementById('btnNavigation').style.width = '32px';
            document.getElementById('btnNavigation').style.height = '32px';
            document.getElementById('btnNavigation').style.top = '15px';
            document.getElementById('btnCamera').style.width = '32px';
            document.getElementById('btnCamera').style.height = '32px';
            document.getElementById('btnCamera').style.top = '60px';           
            document.getElementById('btnFullScreen').style.width = '32px';
            document.getElementById('btnFullScreen').style.height = '32px';
            document.getElementById('btnFullScreen').style.top = '105px';
           
        }
    }
}