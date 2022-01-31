// Virtual Sticks for mobile navigation

let virtualJoystick = {
    xAddPos: 0, 
    yAddPos: 0, 
    xAddRot : 0,
    yAddRot : 0,
    sideJoystickOffset: 150,
    bottomJoystickOffset : -50, 
    leftThumbContainer: null,
    rightThumbContainer: null,
    leftInnerThumbContainer:null,
    rightInnerThumbContainer: null,
    leftPuck: null,
    rightPuck:null,    

    initVirtualStick:function() {},
    transform() {},
    setVisible(val){},
    makeThumbArea: function() {},
    resize(canvas){}

}

virtualJoystick.initVirtualStick = function(adt){		
    
    let _this = virtualJoystick;
    
    _this.leftThumbContainer = this.makeThumbArea("leftThumb", 2, "blue", null);
    _this.leftThumbContainer.height = "200px";
    _this.leftThumbContainer.width = "200px";
    _this.leftThumbContainer.isPointerBlocker = true;
    _this.leftThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    _this.leftThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    _this.leftThumbContainer.alpha = 0.4;
    _this.leftThumbContainer.left = _this.sideJoystickOffset;
    _this.leftThumbContainer.top = _this.bottomJoystickOffset;    

    _this.leftInnerThumbContainer = this.makeThumbArea("leftInnterThumb", 4, "blue", null);
    _this.leftInnerThumbContainer.height = "80px";
    _this.leftInnerThumbContainer.width = "80px";
    _this.leftInnerThumbContainer.isPointerBlocker = true;
    _this.leftInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    _this.leftInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    _this.leftPuck =this.makeThumbArea("leftPuck",0, "blue", "blue");
    _this.leftPuck.height = "60px";
    _this.leftPuck.width = "60px";
    _this.leftPuck.isPointerBlocker = true;
    _this.leftPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    _this.leftPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    _this.leftThumbContainer.onPointerDownObservable.add(function(coordinates) {
            _this.leftPuck.isVisible = true;
            _this.leftPuck.floatLeft = coordinates.x-(_this.leftThumbContainer._currentMeasure.width*.5)-_this.sideJoystickOffset;
            _this.leftPuck.left = _this.leftPuck.floatLeft;
            _this.leftPuck.floatTop = adt._canvas.height - coordinates.y-(_this.leftThumbContainer._currentMeasure.height*.5)+_this.bottomJoystickOffset;
            _this.leftPuck.top = _this.leftPuck.floatTop*-1;
            _this.leftPuck.isDown = true;
            _this.leftThumbContainer.alpha = 0.9;
        });

        _this.leftThumbContainer.onPointerUpObservable.add(function(coordinates) {
            _this.xAddPos = 0;
            _this.yAddPos = 0;
            _this.leftPuck.isDown = false;
            _this.leftPuck.isVisible = false;
            _this.leftThumbContainer.alpha = 0.4;
        });


        _this.leftThumbContainer.onPointerMoveObservable.add(function(coordinates) {
            if (_this.leftPuck.isDown) {
                _this.xAddPos = coordinates.x-(_this.leftThumbContainer._currentMeasure.width*.5)-_this.sideJoystickOffset;
                _this.yAddPos = adt._canvas.height - coordinates.y-(_this.leftThumbContainer._currentMeasure.height*.5)+_this.bottomJoystickOffset;
                _this.leftPuck.floatLeft = _this.xAddPos;
                _this.leftPuck.floatTop = _this.yAddPos*-1;
                _this.leftPuck.left = _this.leftPuck.floatLeft;
                _this.leftPuck.top = _this.leftPuck.floatTop;
                }
        });

    adt.addControl(_this.leftThumbContainer);
    _this.leftThumbContainer.addControl(_this.leftInnerThumbContainer);
    _this.leftThumbContainer.addControl(_this.leftPuck);
    _this.leftPuck.isVisible = false;

    _this.rightThumbContainer = this.makeThumbArea("rightThumb", 2, "red", null);
    _this.rightThumbContainer.height = "200px";
    _this.rightThumbContainer.width = "200px";
    _this.rightThumbContainer.isPointerBlocker = true;
    _this.rightThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    _this.rightThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    _this.rightThumbContainer.alpha = 0.4;
    _this.rightThumbContainer.left = -(_this.sideJoystickOffset);
    _this.rightThumbContainer.top = _this.bottomJoystickOffset;

    _this.rightInnerThumbContainer = this.makeThumbArea("rightInnterThumb", 4, "red", null);
    _this.rightInnerThumbContainer.height = "80px";
    _this.rightInnerThumbContainer.width = "80px";
    _this.rightInnerThumbContainer.isPointerBlocker = true;
    _this.rightInnerThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    _this.rightInnerThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    _this.rightPuck = this.makeThumbArea("rightPuck",0, "red", "red");
    _this.rightPuck.height = "60px";
    _this.rightPuck.width = "60px";
    _this.rightPuck.isPointerBlocker = true;
    _this.rightPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    _this.rightPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;


            _this.rightThumbContainer.onPointerDownObservable.add(function(coordinates) {
            _this.rightPuck.isVisible = true;
            _this.rightPuck.floatLeft = adt._canvas.width - coordinates.x-(_this.rightThumbContainer._currentMeasure.width*.5)-_this.sideJoystickOffset;
            _this.rightPuck.left = _this.rightPuck.floatLeft*-1;
            _this.rightPuck.floatTop = adt._canvas.height - coordinates.y-(_this.rightThumbContainer._currentMeasure.height*.5)+_this.bottomJoystickOffset;
            _this.rightPuck.top = _this.rightPuck.floatTop*-1;
            _this.rightPuck.isDown = true;
            _this.rightThumbContainer.alpha = 0.9;
        });

        _this.rightThumbContainer.onPointerUpObservable.add(function(coordinates) {
            _this.xAddRot = 0;
            _this.yAddRot = 0;
            _this.rightPuck.isDown = false;
            _this.rightPuck.isVisible = false;
            _this.rightThumbContainer.alpha = 0.4;
        });


        _this.rightThumbContainer.onPointerMoveObservable.add(function(coordinates) {
            if (_this.rightPuck.isDown) {
                _this.xAddRot = adt._canvas.width - coordinates.x-(_this.rightThumbContainer._currentMeasure.width*.5)-_this.sideJoystickOffset;
                _this.yAddRot = adt._canvas.height - coordinates.y-(_this.rightThumbContainer._currentMeasure.height*.5)+_this.bottomJoystickOffset;
                _this.rightPuck.floatLeft = _this.xAddRot*-1;
                _this.rightPuck.floatTop = _this.yAddRot*-1;
                _this.rightPuck.left = _this.rightPuck.floatLeft;
                _this.rightPuck.top = _this.rightPuck.floatTop;
                }
        });

    //leftThumbContainer.left = 50;
    adt.addControl(_this.rightThumbContainer);
    _this.rightThumbContainer.addControl(_this.rightInnerThumbContainer);
    _this.rightThumbContainer.addControl(_this.rightPuck);
    _this.rightPuck.isVisible = false;
}


virtualJoystick.transform = function(universalCamera){		

    let _this = virtualJoystick;

    let translateTransform = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(_this.xAddPos/1500, 0, _this.yAddPos/1500), BABYLON.Matrix.RotationY(universalCamera.rotation.y));
    universalCamera.cameraDirection.addInPlace(translateTransform);
    universalCamera.cameraRotation.y += _this.xAddRot/30000*-1;
    universalCamera.cameraRotation.x += _this.yAddRot/30000*-1;

    //console.log('_this.xAddPos : ' + _this.xAddPos);
    //console.log('_this.yAddPos : ' + _this.yAddPos);
}

virtualJoystick.setVisible = function(val){
    let _this = virtualJoystick;

    _this.leftThumbContainer.isVisible = val;
	_this.rightThumbContainer.isVisible = val;			
}

virtualJoystick.makeThumbArea = function(name, thickness, color, background, curves){
    let rect = new BABYLON.GUI.Ellipse();
        rect.name = name;
        rect.thickness = thickness;
        rect.color = color;
        rect.background = background;
        rect.paddingLeft = "0px";
        rect.paddingRight = "0px";
        rect.paddingTop = "0px";
        rect.paddingBottom = "0px";
        
        
    return rect;
}

virtualJoystick.resize = function(canvas){
	
    // screen mode
    const PORTRAIT = 1;
    const LANDSCAPE = 2;
    const OFFSET_LIMIT = 50;
    let screenMode = PORTRAIT;

    let _this = virtualJoystick;
    
    //console.log('canvas width : ' + canvas.width);
	//console.log('canvas height : ' + canvas.height);
    
    
    let newSize; 
        
        // portrait mode
        if( canvas.height >=  canvas.width){
            screenMode = PORTRAIT;
            newSize = (canvas.width / 5);
            if(newSize > 200 ){
                newSize = 200;
            }
        } else {
            // landscape mode
            screenMode = LANDSCAPE;
            newSize = (canvas.height / 5);
            if(newSize > 150 ){
                newSize = 150;
            }
        }

        //console.log('screen mode :' + screenMode);

        // offset
        let offset = (newSize/2.5);
        if(offset < OFFSET_LIMIT){
            _this.sideJoystickOffset = OFFSET_LIMIT;
        } else {
            _this.sideJoystickOffset = offset;
        }

        _this.leftThumbContainer.width = newSize +"px";
        _this.leftThumbContainer.height =  newSize +"px";
        
        this.leftThumbContainer.left =  _this.sideJoystickOffset+"px";	

        _this.leftInnerThumbContainer.width = (newSize/2.5) + "px";
        _this.leftInnerThumbContainer.height = (newSize/2.5) + "px";

        _this.leftPuck.width = (newSize/3.33) + "px";
        _this.leftPuck.height = (newSize/3.33) + "px";

        _this.rightThumbContainer.width = newSize +"px";
        _this.rightThumbContainer.height =  newSize +"px";

        _this.rightThumbContainer.left = -_this.sideJoystickOffset+"px";

        _this.rightInnerThumbContainer.width = (newSize/2.5) + "px";
        _this.rightInnerThumbContainer.height = (newSize/2.5) + "px";

        _this.rightPuck.width = (newSize/3.33) + "px";
        _this.rightPuck.height = (newSize/3.33) + "px";

        //console.log('sideJoystickOffset : ' + _this.sideJoystickOffset);
        
}