    // show cpu-load to user
    var os = require("os");
	var cpu = os.cpus();
	var counter = 0;
	var total=0;
	var free=0;
	var sys=0;
	var user=0;

	for (var i = 0; i<cpu.length ; i++) {
	    total=parseFloat(cpu[i].times.idle)+parseFloat(cpu[i].times.sys)+parseFloat(cpu[i].times.user)+parseFloat(cpu[i].times.irq)+parseFloat(cpu[i].times.nice);
	    free+=100*(parseFloat(cpu[i].times.idle)/total);
	    sys+=100*(parseFloat(cpu[i].times.sys)/total);
	    user+=100*(parseFloat(cpu[i].times.user)/total);
	};
	var cpuload = Number(user/cpu.length + sys/cpu.length);
	var cpuload  = cpuload * 100
	var cpuload = Math.round(cpuload);
	var cpuload = cpuload /100;
	console.log(cpuload)


	


	// var os = require("os"),
	//     cpus = os.cpus();

	// var cpuload;
	// for(var i = 0, len = cpus.length; i < len; i++) {
	//     console.log("CPU %s:", i);
	//     var cpu = cpus[i], total = 0;
	//     for(type in cpu.times)
	//         total += cpu.times[type];

	//     for(type in cpu.times)
	//         console.log("\t", type, Math.round(100 * cpu.times[type] / total));
	// }
