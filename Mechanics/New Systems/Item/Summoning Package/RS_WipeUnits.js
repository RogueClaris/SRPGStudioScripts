RS_UnitDeleter = {
	deleteUnits: function(wipeCode){
		//get player list
		var list1 = PlayerList.getAliveList()
		//get enemy list
		var list2 = EnemyList.getAliveList()
		//get ally list
		var list3 = AllyList.getAliveList()
		//get count of each
		var count1 = list1.getCount()
		var count2 = list2.getCount()
		var count3 = list3.getCount()
		//prepare variables for counting
		var i, j, k
		//prepare for looping
		var l = 0;
		//prepare event generator.
		var Dynamo = createObject(DynamicEvent)
		var Gen = Dynamo.acquireEventGenerator()
		for (i = 0; i < count1; i++){
			//if it's the wipe code
			if (list1.getData(i).custom.RS_WipeCode == wipeCode){
				//remove unit.
				Gen.unitRemove(list1.getData(i), DirectionType.NULL, RemoveOption.DEATH)
				l++
			}
		}
		for (j = 0; j < count2; j++){
			//if it's the wipe code
			if (list2.getData(j).custom.RS_WipeCode == wipeCode){
				//remove unit.
				Gen.unitRemove(list2.getData(j), DirectionType.NULL, RemoveOption.DEATH)
				l++
			}
		}
		for (k = 0; k < count3; k++){
			//if it's the wipe code
			if (list3.getData(k).custom.RS_WipeCode == wipeCode){
				//remove unit
				Gen.unitRemove(list3.getData(k), DirectionType.NULL, RemoveOption.DEATH)
				l++
			}
		}
		//execute.
		Gen.execute()
		root.log("Units removed: "+l.toString())
	}
}
