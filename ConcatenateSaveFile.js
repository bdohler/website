function concatenateSaveFile() {
	var person = {
    name: "Jim Cowart",
    location: {
        city: {
            name: "Chattanooga",
            population: 167674
        },
        state: {
            name: "Tennessee",
            abbreviation: "TN",
            population: 6403000
        }
    },
    company: "appendTo",
	};
	newSaveFile = JSON.stringify(person, null, 4);
}

