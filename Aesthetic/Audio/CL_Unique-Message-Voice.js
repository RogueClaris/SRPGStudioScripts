/*
To use, set two custom parameters on a unit:

{
	UniqueVoiceId:1,
	UniqueVoiceRuntime:false
}

UniqueVoiceId is the ID of the sound effect you
wish to have play when that unit talks. If the
sound is a Runtime Sound Effect, as in it came
with the engine, set UniqueVoiceRuntime to true.
Otherwise set it to false.

Enjoy the script!
*/

var UniqueVoiceCL0 = BaseMessageView._createMessageAnalyzerParam;
BaseMessageView._createMessageAnalyzerParam = function(messageViewParam){
	var result = UniqueVoiceCL0.call(this, messageViewParam);
	if (messageViewParam.unit != null && typeof messageViewParam.unit.custom.UniqueVoiceId === 'number'){
		var unit = messageViewParam.unit;
		result.voiceSoundHandle = root.createResourceHandle(unit.custom.UniqueVoiceRuntime, unit.custom.UniqueVoiceId, 0, 0, 0)
	}
	return result;
}