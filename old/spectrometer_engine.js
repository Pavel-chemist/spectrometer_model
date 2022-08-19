"use strict"

$(function()
{
	
	let $Window = $(window);
	let $SpDiag = $('#spectrometer_diagram');
	let DiagramCtx = $SpDiag[0].getContext("2d");
//	let $SpImage = $('#image_of_spectrum');
//	let SpectrumCtx = $SpImage[0].getContext("2d");
	
	let $AnglesTable = $('#anglesTable');
	
	
	
	let linewidth = 4;
	let raywidth = 1;
	let lshift = -0;
	let rshift = -0.5;
	
	const mm = 10; //pixels per millimeter
	const deg = AngleConvert ( 1, 'toRad' ); //radians per degree
	
	let CRY = 50*mm; //Y-distance of chief input ray from top of base
	
	let cameraLens =
	{
		focusDistance: 21.6*mm,
		radius: 3*mm,
		plane: {}
	};
	
	let collimatingLens =
	{
		focusDistance: 200*mm,
		radius: 25*mm,
		plane: {}
	};
	
	let collimatingLensDistance = 190*mm;
	
	let sensor =
	{
		width: 6.16*mm,
		distanceFromLens: cameraLens.focusDistance,
		plane: {}
	};
	
		
	let slit = 
	{
		width: 1*mm,	//width of slit
		place: 390*mm//+10000*mm	//distance from the base edge
	};
	
	let aperture = 
	{
		width: 20*mm, 	//width of the opening next to grating
		distance: 180*mm//+10000*mm //distance along
	};
	
	let base = //dimensions of base
	{
		width: $SpDiag[0].width,
		height: $SpDiag[0].height
	};
	
	
	
	let pivot = 
	{
		x: 150*mm,
		y: CRY,  //placed on chief incoming ray
		angle: 24*deg	//degrees
	};
	
	
	let grating =
	{
		height: 20*mm,
		width: 30*mm,
		lineDensity: 600,	//lines per millimeter
		angle: 0*deg	//grating turning separately from the rest of platform
	};
	
	let cameraDistance = 100*mm;	
	let numOfMarginalRayPairs = 5;
	let raysOnSensor = [];
	let spectralLineSpacing = 50; //nm
	let renderRayImage = true;
	let numOrders = 1;
	
	let colors = 
	[
		'#ff8080',	//ultra-violet, 351-400nm
		'#ff00ff',	//violet,		401-450nm
		'#0000ff',	//blue,			451-500nm
		'#00ffff',	//cyan,			501-550nm
		'#00ff00',	//green,		551-600nm
		'#ffff00',	//yellow,		601-650nm
		'#ff8000',	//orange,		651-700nm
		'#ff0000',	//red,			701-750nm
		'#800000',	//deep red,		751-800nm
		'#802040',	//ir1,			801-850nm
		'#c04080',	//ir2,			851-900nm
		'#d080a0',	//ir3,			901-950nm
		'#d0a0b0',	//ir4,			951-1000nm
		'#c0c0c0',	//ir5,			1001-1050nm
		'#808080'	//ir6,			>1050nm
	];
	
	
	let cameraShape = 
	{
		anchorPoint:
		{
			x: 31*mm,
			y: 30*mm,
			isVisible: true,
			color: '#ff8080',
			radius: 1*mm
		},
		border: 
		[
			{ x: 0, y: 0 },
			{ x: 31*mm, y: 0 },
			{ x: 31*mm, y: 14*mm },
			{ x: 43*mm, y: 14*mm },
			{ x: 43*mm, y: 17*mm },
			{ x: 58*mm, y: 17*mm },
			{ x: 58*mm, y: 43*mm },
			{ x: 43*mm, y: 43*mm },
			{ x: 43*mm, y: 46*mm },
			{ x: 31*mm, y: 46*mm },
			{ x: 31*mm, y: 94*mm },
			{ x: 0, y: 94*mm },
			{ x: 0, y: 0*mm }
		],
		borderColor: '#002040',
		borderWidth: 4,
		isFilled: false,
		fillColor: '#e0f0ff'
	};
	
	let cameraLensShape =
	{
		anchorPoint:
		{
			x: 0*mm,
			y: 0*mm,
			isVisible: true,
			color: '#000080',
			radius: 0.5*mm
		},
		border: 
		[
			{ x: 0*mm, y: -cameraLens.radius },
			{ x: 0.075*cameraLens.radius, y: -cameraLens.radius*0.75 },
			{ x: 0.127*cameraLens.radius, y: -cameraLens.radius*0.5 },
			{ x: 0.157*cameraLens.radius, y: -cameraLens.radius*0.25 },
			{ x: 0.167*cameraLens.radius, y: 0*mm },
			{ x: 0.157*cameraLens.radius, y: cameraLens.radius*0.25 },
			{ x: 0.127*cameraLens.radius, y: cameraLens.radius*0.5 },
			{ x: 0.075*cameraLens.radius, y: cameraLens.radius*0.75 },
			{ x: 0*mm, y: cameraLens.radius },
			{ x: -0.075*cameraLens.radius, y: cameraLens.radius*0.75 },
			{ x: -0.127*cameraLens.radius, y: cameraLens.radius*0.5 },
			{ x: -0.157*cameraLens.radius, y: cameraLens.radius*0.25 },
			{ x: -0.167*cameraLens.radius, y: 0*mm },
			{ x: -0.157*cameraLens.radius, y: -cameraLens.radius*0.25 },
			{ x: -0.127*cameraLens.radius, y: -cameraLens.radius*0.5 },
			{ x: -0.075*cameraLens.radius, y: -cameraLens.radius*0.75 },
			{ x: 0*mm, y: -cameraLens.radius}
		],
		borderColor: '#002040',
		borderWidth: 2,
		isFilled: true,
		fillColor: '#e0f0ff'
	};
	
	let collimatingLensShape =
	{
		anchorPoint:
		{
			x: 0*mm,
			y: 0*mm,
			isVisible: false,
			color: '#000000',
			radius: 0
		},
		border: 
		[
			{ x: 0*mm, y: -collimatingLens.radius },
			{ x: 0.075*collimatingLens.radius, y: -collimatingLens.radius*0.75 },
			{ x: 0.127*collimatingLens.radius, y: -collimatingLens.radius*0.5 },
			{ x: 0.157*collimatingLens.radius, y: -collimatingLens.radius*0.25 },
			{ x: 0.167*collimatingLens.radius, y: 0*mm },
			{ x: 0.157*collimatingLens.radius, y: collimatingLens.radius*0.25 },
			{ x: 0.127*collimatingLens.radius, y: collimatingLens.radius*0.5 },
			{ x: 0.075*collimatingLens.radius, y: collimatingLens.radius*0.75 },
			{ x: 0*mm, y: collimatingLens.radius },
			{ x: -0.075*collimatingLens.radius, y: collimatingLens.radius*0.75 },
			{ x: -0.127*collimatingLens.radius, y: collimatingLens.radius*0.5 },
			{ x: -0.157*collimatingLens.radius, y: collimatingLens.radius*0.25 },
			{ x: -0.167*collimatingLens.radius, y: 0*mm },
			{ x: -0.157*collimatingLens.radius, y: -collimatingLens.radius*0.25 },
			{ x: -0.127*collimatingLens.radius, y: -collimatingLens.radius*0.5 },
			{ x: -0.075*collimatingLens.radius, y: -collimatingLens.radius*0.75 },
			{ x: 0*mm, y: -collimatingLens.radius}
		],
		borderColor: '#002040',
		borderWidth: 2,
		isFilled: true,
		fillColor: '#e0f0ff'
	};
	
	let sensorShape = 
	{
		anchorPoint:
		{
			x: 0*mm,
			y: 0*mm,
			isVisible: true,
			color: '#008080',
			radius: 0.5*mm
		},
		border: 
		[
			{ x: 0*mm, y: 0*mm },
			{ x: 0*mm, y: -sensor.width/2 },
			{ x: -0.5*mm, y: -sensor.width/2 },
			{ x: -0.5*mm, y: sensor.width/2 },
			{ x: 0*mm, y: sensor.width/2 },
			{ x: 0*mm, y: 0*mm },
			{ x: -0.5*mm, y: 0*mm }
		],
		borderColor: '#000000',
		borderWidth: 1,
		isFilled: true,
		fillColor: '#a0a0a0'
	};
	
	
	let controls = 
	{
		'pivotAngleUp':			function() { pivot.angle += 1*deg; },
		'pivotAngleDown': 		function() { pivot.angle -= 1*deg; },
		'gratingAngleUp': 		function() { grating.angle += 1*deg; },
		'gratingAngleDown': 	function() { grating.angle -= 1*deg; },
		'cameraDistanceUp': 	function() { cameraDistance += 1*mm; },
		'cameraDistanceDown': 	function() { cameraDistance -= 1*mm; },
		'cameraDistanceUp1': 	function() { cameraDistance += 10*mm; },
		'cameraDistanceDown1': 	function() { cameraDistance -= 10*mm; },
		'gratingDensityUp': 	function() { grating.lineDensity += 100; },
		'gratingDensityDown': 	function() { grating.lineDensity -= 100; },
		'rayNumUp': 			function() { numOfMarginalRayPairs += 1; },
		'rayNumDown': 			function() { numOfMarginalRayPairs -= 1; },
		'apertureShiftRight': 	function() { aperture.distance += 1*mm; },
		'apertureShiftRight1': 	function() { aperture.distance += 10*mm; },
		'apertureShiftLeft': 	function() { aperture.distance -= 1*mm; },
		'apertureShiftLeft1': 	function() { aperture.distance -= 10*mm; },
		'slitShiftRight': 		function() { slit.place += 1*mm; },
		'slitShiftRight1': 		function() { slit.place += 10*mm; },
		'slitShiftLeft': 		function() { slit.place -= 1*mm; },
		'slitShiftLeft1': 		function() { slit.place -= 10*mm; },
		'gratingShiftRight': 	function() { pivot.x += 1*mm; },
		'gratingShiftRight1': 	function() { pivot.x += 10*mm; },
		'gratingShiftLeft': 	function() { pivot.x -= 1*mm; },
		'gratingShiftLeft1': 	function() { pivot.x -= 10*mm; },
		'apertureWidthUp': 		function() { aperture.width += 1*mm; },
		'apertureWidthDown': 	function() { aperture.width -= 1*mm; },
		'spectralSpacingUp': 	function() { spectralLineSpacing += 10; },
		'spectralSpacingDown': 	function() { spectralLineSpacing -= 10; },
		'spectralSpacingUp1': 	function() { spectralLineSpacing += 1; },
		'spectralSpacingDown1': function() { spectralLineSpacing -= 1; },
		'sensorDistanceFarther':function() { sensor.distanceFromLens += 0.01*mm; },
		'sensorDistanceCloser': function() { sensor.distanceFromLens -= 0.01*mm; },
		'sensorDistanceFarther1':function() { sensor.distanceFromLens += 0.1*mm; },
		'sensorDistanceCloser1':function() { sensor.distanceFromLens -= 0.1*mm; },
		'colLensShiftLeft': 	function() { collimatingLensDistance -= 1*mm; },
		'colLensShiftLeft1': 	function() { collimatingLensDistance -= 10*mm; },
		'colLensShiftRight': 	function() { collimatingLensDistance += 1*mm; },
		'colLensShiftRight1': 	function() { collimatingLensDistance += 10*mm; },
		'colLensFDistUp': 		function() { collimatingLens.focusDistance += 1*mm; },
		'colLensFDistUp1': 		function() { collimatingLens.focusDistance += 10*mm; },
		'colLensFDistDown': 	function() { collimatingLens.focusDistance -= 1*mm; },
		'colLensFDistDown1': 	function() { collimatingLens.focusDistance -= 10*mm; },
		'slitShiftUp':			function() { CRY -= 1*mm; pivot.y = CRY; },
		'slitShiftDown':		function() { CRY += 1*mm; pivot.y = CRY; },
		'showProjection':		function() { $('#showProjection').addClass('hide'); $('#hideProjection').removeClass('hide'); renderRayImage = true; },
		'hideProjection':		function() { $('#hideProjection').addClass('hide'); $('#showProjection').removeClass('hide'); renderRayImage = false; },
		'orderNumUp':			function() { numOrders += 1; },
		'orderNumDown':			function() { numOrders -= 1; if( numOrders < 1 ){ numOrders = 1 }; },
	};
	
	DrawSpectrometerDiagram( DiagramCtx );
	
	
	
	function DrawSpectrometerDiagram( CanvasCtx )
	{
		CanvasCtx.clearRect(0, 0, base.width, base.height);
		
		DotGrid( CanvasCtx, 1*mm, '#c0c0c0', base.width, base.height, 2 );
		DotGrid( CanvasCtx, 5*mm, '#c0c0c0', base.width, base.height, 4 );
		DotGrid( CanvasCtx, 10*mm, '#c0c0c0', base.width, base.height, 8 );
		DotGrid( CanvasCtx, 10*mm, '#000000', base.width, base.height, 2 );
		
		CanvasCtx.lineWidth = linewidth;
		CanvasCtx.strokeStyle = '#000000';		
		CanvasCtx.beginPath();	
		CanvasCtx.arc( pivot.x, pivot.y, 25*mm, 0, 2*Math.PI, true );
		CanvasCtx.stroke();
		CanvasCtx.closePath();
		
		DrawApertures( CanvasCtx )
		
		DrawShape( DiagramCtx, collimatingLensShape, { x: 0, y: CRY, angle: 180*deg }, collimatingLensDistance );
		collimatingLens.plane = 
		{
			a: Infinity,
			b: CRY,
			center:
			{
				x: collimatingLensDistance,
				y: CRY
			}
		};
		
	//	console.log(collimatingLens);
		
		let rays = DrawIncomingRays( DiagramCtx, numOfMarginalRayPairs );
		
			
		let gratingLine = DrawGrating( DiagramCtx );
		
		
		
		raysOnSensor = []; //clearing up an array
		
		cameraLens.plane = DrawShape( DiagramCtx, cameraLensShape, pivot, cameraDistance - 15*mm );
		
		sensor.plane = 
		{
			a: cameraLens.plane.a,
			b: cameraLens.plane.b + sensor.distanceFromLens / ( Math.cos( Math.atan( cameraLens.plane.a ) ) ),
			center: 
			{
				x: cameraLens.plane.center.x - sensor.distanceFromLens * ( Math.sin( Math.atan( cameraLens.plane.a ) ) ),
				y: cameraLens.plane.center.y + sensor.distanceFromLens * ( Math.cos( Math.atan( cameraLens.plane.a ) ) )
			}
		};
	
		DrawLine( CanvasCtx, { x: 0, y: cameraLens.plane.b }, { x: base.width, y: cameraLens.plane.a*base.width + cameraLens.plane.b}, 2, '#80b0ff', { width: 0, period: 0} );
		DrawLine( CanvasCtx, { x: 0, y: sensor.plane.b }, { x: base.width, y: sensor.plane.a*base.width + sensor.plane.b}, 2, '#80ffb0', { width: 0, period: 0} );
		
		DrawDiffractedRays( DiagramCtx, gratingLine, rays );
		
		DrawShape( DiagramCtx, cameraShape, pivot, cameraDistance );
		DrawShape( DiagramCtx, sensorShape, pivot, cameraDistance - 15*mm + sensor.distanceFromLens );
	
		DrawCircle( CanvasCtx, sensor.plane.center, 0.5*mm, '#000000' );
		DrawCircle( CanvasCtx, sensor.plane.center, 0.25*mm, '#ff0000' );
	
		if ( renderRayImage )
		{
			RenderRays( CanvasCtx );
		}
		
		FillDisplayValues();
	}
	
	function DrawApertures( CanvasCtx )
	{
		//input apertures
		CanvasCtx.beginPath();
	//slit
		CanvasCtx.moveTo(slit.place +  lshift, 10*mm);
		CanvasCtx.lineTo(slit.place +  lshift, CRY - slit.width);
	
		CanvasCtx.moveTo(slit.place +  lshift, CRY + slit.width);
		CanvasCtx.lineTo(slit.place +  lshift, 90*mm);
	//diaphragm
		CanvasCtx.moveTo(aperture.distance +  lshift, 10*mm);
		CanvasCtx.lineTo(aperture.distance +  lshift, CRY - aperture.width / 2 );
	
		CanvasCtx.moveTo(aperture.distance +  lshift, CRY + aperture.width / 2 );
		CanvasCtx.lineTo(aperture.distance +  lshift, 90*mm);
		
		CanvasCtx.stroke();		
		CanvasCtx.closePath();
	}
	
	function DrawDiffractedRays( CanvasCtx, gratingLine, rays )
	{
		//gratingLine: a, b
		//rays = [ ray1, ray2, ray3 ... ]
		//ray: a, b
	//	console.log(grating);
	//	console.log( grating.angle );
		for ( let i = 0; i < rays.length; i++ )
		{
		
			let diffractionPoint = 	{}			//is computed as intersection of diffraction grating and incoming ray
			let incomingAngle = - Math.atan(rays[i].a);
			
			
			if ( gratingLine.a != Infinity && gratingLine.a != -Infinity )
			{
				diffractionPoint =
				{
					x: (rays[i].b - gratingLine.b)/(gratingLine.a - rays[i].a),
					y: rays[i].a * (rays[i].b - gratingLine.b)/(gratingLine.a - rays[i].a) + rays[i].b
				}; 
			}
			else
			{
				diffractionPoint =
				{
					x: gratingLine.b,
					y: rays[i].a * gratingLine.b + rays[i].b
				};
			}
		//	console.log(diffractionPoint);
			if ( spectralLineSpacing < 5 )
			{
				spectralLineSpacing = 5;
			}
			
			for ( let lambda = 350; lambda < 1051; lambda += spectralLineSpacing )
			{
				for ( let order = 1; order < numOrders+1; order++ )
				{
					DrawRay( CanvasCtx, lambda, DiffractionAngle( order*lambda, grating.angle + incomingAngle ), diffractionPoint ); //1st order
				}
			}
		}
	}
	
	
	function DotGrid( CanvasCtx, period, color, width, height, dotSize )
	{
		CanvasCtx.fillStyle = color;
		let horNum = Math.floor( width / period );
		let verNum = Math.floor( height / period );
		for ( let i = 1; i < horNum; i++ )
		{
			for ( let j = 1; j < verNum; j++ )
			{
				DiagramCtx.fillRect(i*period - dotSize/2, j*period - dotSize/2, dotSize, dotSize);
			}
		}
	}
	
	function DrawGrating( CanvasCtx )
	{
		
		//angle in degrees, perpendicular to incoming ray is 0
		//grating width is 3cm, or 300 points
		//pivot.x = pivot, pivot.y = CRY
		//grating is drawn with two lines, one solid, and one dashed
		
		let radAngle = grating.angle
		
		let halfWidth = grating.width / 2;
		
		let gratingShape = 
		{
			x1: pivot.x - Math.sin(radAngle)*halfWidth,
			y1: CRY - Math.cos(radAngle)*halfWidth,
			x2: pivot.x + Math.sin(radAngle)*halfWidth,
			y2: CRY + Math.cos(radAngle)*halfWidth,
			xd1: pivot.x - Math.cos(radAngle)*linewidth - Math.sin(radAngle)*halfWidth,
			yd1: CRY + Math.sin(radAngle)*linewidth - Math.cos(radAngle)*halfWidth,
			xd2: pivot.x - Math.cos(radAngle)*linewidth + Math.sin(radAngle)*halfWidth,
			yd2: CRY + Math.sin(radAngle)*linewidth + Math.cos(radAngle)*halfWidth
		};
		
		let A = (gratingShape.y1 - gratingShape.y2)/(gratingShape.x1 - gratingShape.x2); 
		let B;
		
		if ( A == Infinity || A == -Infinity )
		{
			B = pivot.x;
		}
		else
		{
			B = gratingShape.y1 - A	* gratingShape.x1;
		}
		
		
		let gratingLine = 
		{
			a: A,
			b: B
		};
		
		DrawLine( CanvasCtx, { x: gratingShape.x1, y: gratingShape.y1 }, { x: gratingShape.x2, y: gratingShape.y2 }, linewidth, '#000000', { width: 0, period: 0} );
		DrawLine( CanvasCtx, { x: gratingShape.xd1, y: gratingShape.yd1 }, { x: gratingShape.xd2, y: gratingShape.yd2 }, linewidth, '#000000', { width: 4, period: 4} );
		
		return gratingLine;
	}
	
	function DrawIncomingRays( CanvasCtx, marginalPairNumber )
	{
		//affected by collimating lens
		//2 sets of rays are formed: uncollimated and collimated; 
		//only those which are to go through grating are pushed to 'rays' array
		let rayNumber = 1 + 2*marginalPairNumber;
		
		let rays = [];
		
		for ( let i = 0; i < rayNumber; i++ )
		{
			let A = (aperture.width/2 - i*aperture.width/(2*marginalPairNumber))/(slit.place - aperture.distance);
			let B = CRY - ((aperture.width/2 - i*aperture.width/(2*marginalPairNumber))/(slit.place - aperture.distance)) * (slit.place);
			
			let r = A * collimatingLensDistance + B - CRY;
			let Ar = A + r / collimatingLens.focusDistance;
			let Br = A * collimatingLensDistance + B - Ar * collimatingLensDistance; 
			
			DrawLine( 	CanvasCtx,   //CanvasCtx,
						{ x: base.width, y: (A * base.width + B) + rshift },  //start{a, b}
						{ x: collimatingLensDistance, y: (A * collimatingLensDistance + B) + rshift },	//end{a, b}
						raywidth,		//width
						'#808080',		//color
						{ width: 0, period: 0 }	  //dash{ width, period }
					);
			
			DrawLine( 	CanvasCtx,   //CanvasCtx,
						{ x: collimatingLensDistance, y: (Ar * collimatingLensDistance + Br) + rshift },  //start{a, b}
						{ x: 0, y: Br + rshift },	//end{a, b}
						raywidth,		//width
						'#808080',		//color
						{ width: 0, period: 0 }	  //dash{ width, period }
					);
			
			if ( collimatingLensDistance < pivot.x )
			{
				rays.push( { a: A, b: B	});
			}
			else
			{
				rays.push( { a: Ar, b: Br });
			}
		}
	//			( CanvasCtx, start, end, width, color, dash )
	/*
		for ( let i = 0; i < rayNumber; i++ )
		{
			
		}
		*/
		
		return rays;
	}
	
	
	function DiffractionAngle ( lambda, incomingAngle )
	{
		
		//lambda is in nm
		//d is also should be in nm
		//in one millimeter there are million nanometers
		//apparent d also affected by angle of incoming light
		let d = ( 1000000 / grating.lineDensity );// * Math.cos(Math.PI*incomingAngle/180);
		
		let diffractionAngle; //returned value
		
		diffractionAngle = Math.asin(lambda/d - Math.sin(incomingAngle)) + incomingAngle;
		
	//	$AnglesTable.append($(`<div>${lambda}nm ---- ${diffractionAngle.toFixed(2)}</div>`));
		
		return diffractionAngle;
	}
	
	function DrawRay ( CanvasCtx, lambda, angle, start )
	{
		//draws ray from the point of origin ('start')
		//color picked using LUT according to wavelength
		let color = colors[Math.floor((lambda+1)/50 - 7)];
		let changeDirection = false;
		if ( angle > 90*deg )
		{
			angle = Math.PI-angle;
			changeDirection = true;
		}

		let A = Math.tan(-angle);
		let B = start.y - A * start.x;

		
	// terminate ray at cameraLens plane
		let rayEnd =
		{
			x: (cameraLens.plane.b - B)/(A - cameraLens.plane.a),
			y: A * (cameraLens.plane.b - B)/(A - cameraLens.plane.a) + B
		}
		
		DrawLine( CanvasCtx, start, rayEnd, raywidth, color, { width: 0, period: 0} );
		
	// trace refracted rays up to sensor
		
		let refractedRay = Refract ( { a: A, b: B }, rayEnd );
		let refractedRayEnd =
		{
			x: (sensor.plane.b - refractedRay.ray.b)/(refractedRay.ray.a - sensor.plane.a),
			y: refractedRay.ray.a * (sensor.plane.b - refractedRay.ray.b)/(refractedRay.ray.a - sensor.plane.a) + refractedRay.ray.b
		}
		
		
		if ( refractedRay.distance <= cameraLens.radius ) //working only with rays passed through camera lens
		{
			
			DrawLine( CanvasCtx, rayEnd, refractedRayEnd, raywidth, color, { width: 0, period: 0} );
		
	// get intersections of refracted rays and sensor
	// cameraLens and sensor planes are parallel
	// cameraLens and sensor have restriced widths	
		
			let r = Math.sqrt( 	(refractedRayEnd.x - sensor.plane.center.x) * (refractedRayEnd.x - sensor.plane.center.x) + 
								(refractedRayEnd.y - sensor.plane.center.y) * (refractedRayEnd.y - sensor.plane.center.y) );
			
		
			if ( r <= sensor.width/2 )
			{
				let R = r;
				if ( refractedRayEnd.y - sensor.plane.center.y < 0 )
				{
					R = -r;
				}
				
				raysOnSensor.push( { r: R, color: color } );
			
			}
		
		}
	}
	
	function Refract ( ray, intersection )
	{
		//ray{ a, b }
		//cameraLens.plane{ a, b, center{ x, y } }
		//intersection{ x, y }
		//find distance from cameraLens center
		let r = Math.sqrt( (intersection.x - cameraLens.plane.center.x) * (intersection.x - cameraLens.plane.center.x) + (intersection.y - cameraLens.plane.center.y) * (intersection.y - cameraLens.plane.center.y) );
		// set the sign relative to center
		let signedR = r;
		if ( intersection.y - cameraLens.plane.center.y < 0 )
		{
			signedR = -r;
		}
		//calculate change of angle
	
		// let first rotate the ray
		
		let A = Math.tan(Math.atan(Math.tan(Math.atan(ray.a) + pivot.angle) + signedR / cameraLens.focusDistance) - pivot.angle);
		let B = - A * intersection.x + intersection.y;
		
		let refractedRay = 
		{
			a: A,
			b: B
		};
		
		return { ray: refractedRay, distance: r };
	}
	
	
	
	function DrawShape( CanvasCtx, shape, pivot, pivotDistance )
	{
		//draws shape anywhere on canvas, can be translated and rotated
		//shape is an array of point objects
		//pivotDistance sets the distance from chosen pivot point
		//pivot is a point with coordinates and vector pointing at set angle
		
		let translatedAnchor = 
		{
			x: pivot.x - pivotDistance, 
			y: pivot.y 		
		};
		
		let transRotAnchor = Rotate( translatedAnchor, pivot );
		
		
		//what does start mean at this point?
		let start = 
		{
			x: translatedAnchor.x - shape.anchorPoint.x,
			y: translatedAnchor.y - shape.anchorPoint.y 
		};
		
		
		let rotatedStart = Rotate( { x: (shape.border[0].x + start.x), y: (shape.border[0].y + start.y) }, pivot );
		let rotatedShapePoint;
		
		
		CanvasCtx.lineWidth = shape.borderWidth;
		CanvasCtx.setLineDash([0]);
		CanvasCtx.strokeStyle = shape.borderColor;
		CanvasCtx.fillStyle = shape.fillColor;
		CanvasCtx.beginPath();
		
		CanvasCtx.moveTo(rotatedStart.x, rotatedStart.y);
		
		for ( let i = 0; i < shape.border.length; i++ )
		{
			rotatedShapePoint = Rotate( { x: (shape.border[i].x + start.x), y: (shape.border[i].y + start.y) }, pivot );
			CanvasCtx.lineTo(rotatedShapePoint.x, rotatedShapePoint.y);
		}
		
		if ( shape.isFilled )
		{
			CanvasCtx.fill();
		}
		CanvasCtx.stroke();	
		CanvasCtx.closePath();
		
		if ( shape.anchorPoint.isVisible )
		{
			DrawCircle ( CanvasCtx, transRotAnchor, shape.anchorPoint.radius, shape.anchorPoint.color );
		}
		
		//get line through anchor, and perpendicular to radius
		let perpend_plane = 
		{
			a: Math.tan(90*deg - pivot.angle),
			b: transRotAnchor.y - Math.tan(90*deg - pivot.angle) * transRotAnchor.x,
			center: transRotAnchor
		}
		
		return perpend_plane;
		
	}
	
	function RenderRays( CanvasCtx )
	{
		let scale = 60;
		CanvasCtx.fillStyle = '#000000';
		CanvasCtx.fillRect(0, base.height - 20*mm, base.width, 20*mm);
		CanvasCtx.fillStyle = '#808080';
		CanvasCtx.fillRect(0.5*mm, base.height - 19.5*mm, base.width-1*mm, 19*mm);
		CanvasCtx.fillStyle = '#000000';
		CanvasCtx.fillRect((base.width-sensor.width*scale)/2, base.height - 18.5*mm, sensor.width*scale, 17*mm);
		
		for ( let i = 0; i < raysOnSensor.length; i++ )
		{
			DrawLine( 	CanvasCtx, 
						{ x: (raysOnSensor[i].r*scale + base.width/2), y: base.height - 17*mm }, 
						{ x: (raysOnSensor[i].r*scale + base.width/2), y: base.height - 3*mm }, 
						1, 
						raysOnSensor[i].color, 
						{ width: 0, period: 0 }
					);
		}
		
	}

	function Rotate ( point, pivot )
	{
		//point.x, point.y;
		//pivot.x, pivot.y, pivot.angle
		
		
	//	let radAngle = - AngleConvert( pivot.angle, 'toRad' );
		let radAngle = - pivot.angle;
		
		let rotatedPoint = 
		{
			x: (point.x - pivot.x) * Math.cos(radAngle) - (point.y - pivot.y) * Math.sin(radAngle) + pivot.x,
			y: (point.x - pivot.x) * Math.sin(radAngle) + (point.y - pivot.y) * Math.cos(radAngle) + pivot.y
		}
		
		return rotatedPoint;
	}
	
	
	function AngleConvert ( angle, direction )
	{
		let convertedAngle;
		
		if ( direction === 'toDeg' )
		{
			convertedAngle = 180 * angle / Math.PI;
		}
		else if ( direction === 'toRad' )
		{
			convertedAngle = Math.PI * angle / 180;
		}
		else
		{
			console.log('AngleConvert error: invalid direction, should be "toDeg" or "toRad".');
			convertedAngle = 0;
		}
		
		return convertedAngle;
	}
	
	
	function DrawCircle ( CanvasCtx, center, radius, color )
	{
		//center= { x: xcoord, y: ycoord }
		if ( color != undefined )
		{
			CanvasCtx.fillStyle = color;
		}
		else
		{
			CanvasCtx.fillStyle = '#ff0000';
		}
		CanvasCtx.beginPath();
		CanvasCtx.arc(center.x, center.y, radius, 0, 2*Math.PI, true );
		CanvasCtx.fill();
		CanvasCtx.closePath();
		
	}
	

	
	function DrawLine ( CanvasCtx, start, end, width, color, dash )
	{
		CanvasCtx.lineWidth = width;
		CanvasCtx.setLineDash([dash.width, dash.period]);
		CanvasCtx.strokeStyle = color;
		CanvasCtx.beginPath();		
		CanvasCtx.moveTo(start.x, start.y);
		CanvasCtx.lineTo(end.x, end.y);
		CanvasCtx.stroke();	
		CanvasCtx.closePath();
	}

	function FillDisplayValues()
	{
		$('#pivotAngleDisplay').text( (pivot.angle/deg).toFixed(0) );
		$('#gratingAngleDisplay').text( (grating.angle/deg).toFixed(0) );
		$('#cameraDistanceDisplay').text( (cameraDistance/mm).toFixed(0) );
		$('#gratingDensityDisplay').text( grating.lineDensity );
		$('#rayNumDisplay').text( numOfMarginalRayPairs*2+1 );
		$('#apertureDisplay').text( aperture.distance/mm );
		$('#slitDisplay').text( slit.place/mm );
		$('#gratingDistanceDisplay').text( pivot.x/mm );
		$('#apertureWidthDisplay').text( aperture.width/mm );
		$('#spectralSpacingDisplay').text( spectralLineSpacing );
		$('#sensorDistanceDisplay').text( `${(sensor.distanceFromLens/mm).toFixed(2)} (${(sensor.distanceFromLens/cameraLens.focusDistance).toFixed(3)}F)`);
		$('#focusDistanceDisplay').text( `${((sensor.distanceFromLens*cameraLens.focusDistance)/(1000*(sensor.distanceFromLens-cameraLens.focusDistance))).toFixed(0)}`);
		$('#colLensDistDisplay').text( collimatingLensDistance/mm );
		$('#colLensFDistDisplay').text( collimatingLens.focusDistance/mm );
		$('#slitVdistDisplay').text( CRY/mm );
		$('#orderNumDisplay').text( numOrders );
	}
	
	function ClickHandler( $target )
	{	
		controls[$target.attr('id')]();		
		DrawSpectrometerDiagram( DiagramCtx );		
	}
	
	
	
	$Window.on('click', function(ev){
		ClickHandler ( $(ev.target) );
	});

})
