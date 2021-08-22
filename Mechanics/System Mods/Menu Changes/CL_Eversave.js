SaveScreenLauncher.isLaunchable = function() {
	/*
	comment this out to allow saving during gameplay at any time.
	if (root.getCurrentScene() === SceneType.FREE) {
		return !SceneManager.getActiveScene().getTurnObject().isPlayerActioned();
	}
	*/
	
	return true;
}