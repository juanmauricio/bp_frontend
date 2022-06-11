module.exports = function(grunt){

    const _ = grunt.util._; //lodash

    grunt.registerTask("homepage", "generated home page html file for our app", function(){
        let context = '', source = '', targetConfig = '', template = '', target = ''; 
        target = target || "dist";
        this.requiresConfig("homepage.template");
        this.requiresConfig(`homepage.${target}`);
        template = grunt.config.get("homepage.template");
        targetConfig = grunt.config.get(`homepage.${target}`);
        source = grunt.file.read(template);
        context = _(grunt.config.get()).extend(targetConfig.context);
        grunt.file.write(targetConfig.dest, _(source).template(context));
        grunt.log.writeln(`Homapage HTML written '${targetConfig.dest}'`)
    });

}