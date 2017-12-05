# Apex Visualizer (For Apache Apex)

Apex Visualizer is a visualizer for [Apache Apex](http://apex.apache.org/) for representing dag and usage metrics.

#### Start the project

This project is developed in Node Js using Express JS framework. Steps to start the project

- Configure `config/default.json` to point valid inputs. Below is an exa
mple for adding more config.
- Navigate to `./apexvisualizer`
- Install npm packages using `npm install`
- run `npm start` command. Go to http://localhost:3000

#### Add more configurations:

All the configurations can be added in config/default.json. With the current impl
mentation only default.json is supported. These configurations will appear in
the drop down in the UI.

Add configurations:

    {
      "default_env" : "prod",
      "prod" : {
        "yarn_url" : "http://localhost:8088"
      },
      "stage" : {
        "yarn_url" : "http://stage.local:8088"
      }
    }

**SSL enabled url's are not supported in current version.**
