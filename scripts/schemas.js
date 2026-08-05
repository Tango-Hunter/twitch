/******************************************************************************
 *
 * File: schemas.js
 * Author: Tango Hunter
 *
 * Description:
 * Defines the available content editor applications and the templates used
 * to dynamically generate each editor.
 *
 * This file intentionally contains NO application logic.
 * It serves only as configuration data for content-manager.js.
 *
 ******************************************************************************/

const SCHEMAS = Object.freeze({

    /*==========================================================================
        TECH STREAMS
    ==========================================================================*/

    tech: {

        id: "tech",

        applicationTitle: "Tech Streams Editor",

        applicationDescription:
            "Create and maintain technology livestreams and recorded content displayed on the Tech page.",

        jsonFile: "tech-streams.json",

        jsonUrl: "https://cdn.jsdelivr.net/gh/Tango-Hunter/twitch@main/assets/data/tech-streams.json",

        template: [

            {
                id: "title",

                label: "Title",

                type: "text",

                class: "field-long",

                placeholder: "Stream/Video Title",

                default: ""
            },

            {
                id: "video",

                label: "YouTube Embed",

                type: "text",

                class: "field-long",

                placeholder: "Video ID",

                default: ""
            },

            {
                id: "date",

                label: "Date",

                type: "date",

                class: "field-short",

                default: ""
            },

            {
                id: "description",

                label: "Description",

                type: "textarea",

                class: "field-large",

                placeholder: "Brief description of the livestream...",

                default: ""
            },

            {
                id: "tech",

                label: "Technology Stack",

                type: "array",

                class: "field-array",

                addButton: {

                    text: "Add Technology",

                    class: "btn-add"

                },

                removeButton: {

                    text: "✖",

                    class: "btn-remove"

                },

                template: [

                    {
                        id: "name",

                        label: "Technology",

                        type: "text",

                        class: "field-short",

                        placeholder: "JavaScript",

                        default: ""
                    },

                    {
                        id: "link",

                        label: "Documentation URL",

                        type: "url",

                        class: "field-long",

                        placeholder: "https://developer.mozilla.org/",

                        default: ""
                    }

                ]

            }

        ],

        display: {

            layout: "split",

            filters: {

                field: "tech",

                title: "Technology"

            },

            fields: [

                {
                    id: "title",

                    element: "h3",

                    class: "modal-title",

                    card: true,

                    modal: true

                },

                {
                    id: "video",

                    element: "thumbnail",

                    class: "thumbnail",

                    card: true,

                    modal: false

                },

                {
                    id: "video",

                    element: "video",

                    class: "modal-video",

                    card: false,

                    modal: true

                },

                {
                    id: "date",

                    element: "p",

                    class: "content-date",

                    card: true,

                    modal: true

                },

                {
                    id: "description",

                    element: "p",

                    class: "content-description",

                    card: false,

                    modal: true

                },

                {
                    id: "tech",

                    element: "tags",

                    class: "technology-stack",

                    card: false,

                    modal: true

                }

            ]

        }

    },



    /*==========================================================================
        SYNARA UPDATES
    ==========================================================================*/

    updates: {

        id: "updates",

        applicationTitle: "SYNARA Updates Editor",

        applicationDescription:
            "Create version releases, update notes, bug fixes, and feature announcements for the SYNARA Updates page.",

        jsonFile: "synara-updates.json",

        jsonUrl: "https://cdn.jsdelivr.net/gh/Tango-Hunter/twitch@main/assets/data/synara-updates.json",

        template: [

            {
                id: "version",

                label: "Version",

                type: "text",

                class: "field-short",

                placeholder: "vX.X.X",

                default: ""
            },

            {
                id: "title",

                label: "Title",

                type: "text",

                class: "field-long",

                placeholder: "Major/Minor/Patch",

                default: ""
            },

            {
                id: "date",

                label: "Date",

                type: "date",

                class: "field-short",

                default: ""
            },

            {
                id: "summary",

                label: "Summary",

                type: "textarea",

                class: "field-medium",

                placeholder: "Short overview shown on the update card.",

                default: ""
            },

            {
                id: "notes",

                label: "Release Notes",

                type: "array",

                class: "field-array",

                addButton: {

                    text: "Add Note",

                    class: "btn-add"

                },

                removeButton: {

                    text: "✖",

                    class: "btn-remove"

                },

                template: [

                    {
                        id: "note",

                        label: "Note",

                        type: "textarea",

                        class: "field-large",

                        placeholder: "Describe a feature, improvement, bug fix, or change...",

                        default: ""
                    }

                ]

            }

        ],

        display: {

            layout: "standard",
            
            fields: [

                {
                    id: "version",

                    element: "h3",

                    class: "modal-title",

                    card: true,

                    modal: true

                },

                {
                    id: "title",

                    element: "p",

                    class: "content-subtitle",

                    card: true,

                    modal: true

                },

                {
                    id: "date",

                    element: "p",

                    class: "content-date",

                    card: true,

                    modal: true

                },

                {
                    id: "summary",

                    element: "p",

                    class: "content-description",

                    card: true,

                    modal: true

                },

                {
                    id: "notes",

                    element: "list",

                    class: "notes",

                    card: false,

                    modal: true

                }

            ]

        }

    },



    /*==========================================================================
        SYNARA FEATURES
    ==========================================================================*/
    features: {

        id: "features",

        applicationTitle: "SYNARA Features Editor",

        applicationDescription:
            "Create and maintain the complete list of features available in SYNARA.",

        jsonFile: "synara-features.json",

        jsonUrl: "https://cdn.jsdelivr.net/gh/Tango-Hunter/twitch@main/assets/data/synara-features.json",

        template: [

            {
                id: "name",

                label: "Feature Name",

                type: "text",

                class: "field-short",

                placeholder: "Message Queue",

                default: ""
            },

            {
                id: "category",

                label: "Category",

                type: "select",

                class: "field-medium",

                default: "",

                options: [

                    {
                        value: "Community - Features that build community interaction.",
                        label: "Community"
                    },

                    {
                        value: "Engagement - Features that encourage conversation and participation.",
                        label: "Engagement"
                    },

                    {
                        value: "Administration - Administrative tools and moderation features.",
                        label: "Administration"
                    },

                    {
                        value: "Automation - Background systems that operate automatically.",
                        label: "Automation"
                    },

                    {
                        value: "Informational - Documentation, guides, and informational content.",
                        label: "Information"
                    }

                ]

            },

            {
                id: "purpose",

                label: "Purpose",

                type: "textarea",

                class: "field-large",

                placeholder:
                    "Describe what this feature does and why it exists.",

                default: ""
            },

            {
                id: "requiredSettings",

                label: "Configuration Requirements",

                type: "textarea",

                class: "field-large",

                placeholder:
                    "List any required roles, channels, permissions, or configuration.",

                default: ""
            },

            {
                id: "notes",

                label: "Additional Notes",

                type: "textarea",

                class: "field-large",

                placeholder:
                    "Optional implementation notes or additional information.",

                default: ""
            },

            {
                id: "commands",

                label: "Commands",

                type: "array",

                class: "field-array",

                addButton: {

                    text: "Add Command",

                    class: "btn-add"

                },

                removeButton: {

                    text: "✖",

                    class: "btn-remove"

                },

                template: [

                    {

                        id: "name",

                        label: "Command",

                        type: "text",

                        class: "field-short",

                        placeholder: "/queue",

                        default: ""

                    },

                    {

                        id: "description",

                        label: "Description",

                        type: "text",

                        class: "field-long",

                        placeholder:
                            "Creates a new message queue.",

                        default: ""

                    }

                ]

            }

        ],

        display: {
                     
            filters: {

                field: "category",

                title: "Category"

            },        

            layout: "standard",
            
            fields: [

                {
                    id: "name",

                    element: "h3",

                    class: "modal-title",

                    card: true,

                    modal: true

                },

                {
                    id: "category",

                    element: "badge",

                    class: "content-category",

                    card: true,

                    modal: true

                },

                {
                    id: "purpose",

                    element: "p",

                    class: "content-description",

                    card: true,

                    modal: true

                },

                {
                    id: "requiredSettings",

                    element: "section",

                    class: "requirements",

                    card: false,

                    modal: true

                },

                {
                    id: "notes",

                    element: "section",

                    class: "notes",

                    card: false,

                    modal: true

                },

                {
                    id: "commands",

                    element: "list",

                    class: "command-list",

                    card: false,

                    modal: true

                }

            ]

        }

    },



    /*==========================================================================
        SYNARA COMMANDS
    ==========================================================================*/

    commands: {

        id: "commands",

        applicationTitle: "SYNARA Commands Editor",

        applicationDescription:
            "Create and maintain the complete list of commands available in SYNARA.",

        jsonFile: "synara-commands.json",

        jsonUrl: "https://cdn.jsdelivr.net/gh/Tango-Hunter/twitch@main/assets/data/synara-commands.json",

        template: [

            {
                id: "command",

                label: "Command",

                type: "text",

                class: "field-short",

                placeholder: "/help",

                default: ""
            },

            {
                id: "category",

                label: "Category",

                type: "select",

                class: "field-medium",

                default: "",

                options: [

                    {
                        value: "Administrative Command - Commands intended for server administrators and moderators.",

                        label: "Administrative Command"
                    },

                    {
                        value: "Community Command - Commands available to all community members.",

                        label: "Community Command"
                    }

                ]

            },

            {
                id: "purpose",

                label: "Purpose",

                type: "textarea",

                class: "field-large",

                placeholder:
                    "Describe what this command does and when it should be used.",

                default: ""
            },

            {
                id: "subOptions",

                label: "Sub-Options",

                type: "array",

                class: "field-array",

                addButton: {

                    text: "Add Sub-Option",

                    class: "btn-add"

                },

                removeButton: {

                    text: "✖",

                    class: "btn-remove"

                },

                template: [

                    {
                        id: "option",

                        label: "Option",

                        type: "text",

                        class: "field-short",

                        placeholder: "reload",

                        default: ""
                    },

                    {
                        id: "description",

                        label: "Description",

                        type: "text",

                        class: "field-long",

                        placeholder:
                            "Reloads all configuration files.",

                        default: ""
                    }

                ]

            }

        ],

        display: {
                     
            filters: {

                field: "category",

                title: "Category"

            },        

            layout: "standard",
            
            fields:  [

                {
                    id: "command",

                    element: "h3",

                    class: "modal-title",

                    card: true,

                    modal: true

                },

                {
                    id: "category",

                    element: "badge",

                    class: "content-category",

                    card: true,

                    modal: true

                },

                {
                    id: "purpose",

                    element: "p",

                    class: "content-description",

                    card: true,

                    modal: true

                },

                {
                    id: "subOptions",

                    element: "list",

                    class: "suboption-list",

                    card: false,

                    modal: true

                }

            ]

        }

    }

});
