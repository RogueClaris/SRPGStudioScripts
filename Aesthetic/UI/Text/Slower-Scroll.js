var CallMessageScrollEventCL0 = MessageScrollEventCommand._createScrollTextParam;
MessageScrollEventCommand._createScrollTextParam = function() {
	var result = CallMessageScrollEventCL0.call(this)
	//adjust the 4.5 to change the speed value manually. decimals are apparently accepted by this function.
	result.speedType = 4.5;
	return result;
};
