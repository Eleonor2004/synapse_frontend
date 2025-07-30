
Hi Claude!You are an expert in web development even one of the best specialized in nestjs with tailwind css and typescript and an amazinf UI/UX that has made one of the best ranked designed web pages in the world.  I'm working on a **Next.js project** with type script and tailwind css already configured, and I want your help me build the core page of my application: a functional workbench to view interactions between individuals from their listings and location graph. Here’s the full scope of what I need help with, progressively:

---

### 🚀 Project Context

I have already:

* Set up **internationalization (i18n)** using `next-intl` and defined the theme of colors in globals.css that have to be uded althrough the appplication
* Implemented **theme switching** (light/dark mode)
* Created **routing and pages**
* Built most components and pages and basic structure for components
* 

Now, I want you to help me:


### 🔄 ** Build a functional workbench**
I want the workbench to be be well designed and do all the task to be done, with responsive.we will use libairies such as vis.js, D3.js for the grapphs.  It is the core of our application. So it should be really well done:
 * We should import excel files with extension .xlsx, or extract those files from a zip or from a folder. and verify that this excel file has the following sheets within it: "Abonné", "Listing", "Fréquence par cellule", "Fréquence Correspondant", "Fréquence par Durée appel", "Fréquence par IMEI", "Identification des abonnés"
 * After the import a message will be displayed about the import if it failed, or if it was successful, so you will create a component for that that will display that message at the top right of screen and will be used althrouh the app, the color used should be indicative of the type of message: warning, info, success, failure ...
 * Next we will display two main graphs by exploiting the infos obtained from the different sheets, the aim of this app is to be able to visualize the interactions of an individual with people based on his listing so the interactions are seen in the sheet "Listing", an individual is identified by his number: so on the graph the nodes will be the individuals and the edges will be the interactions they had: SMS or call
 * Besides that we should be able to get informations about an individual by clicking on a node that will display those infos about the individual in a little node just like in Google Maps for places
 * The level of interaction of individuals should be seen from the color of their edges in progressive range: from green, yellow, orange, to red increeasingly also the size of the node should be obtained from the lelvel of interactions the indidual has
 * We should also have components for filter(based on interaction through SMS, phone calls, period of interaction, Interactions with one or more individuals identified by their IMEI or phone number) and search
 * The second graph should display the different localization of people through the day on a localization graph from Google Maps or Open street maps such that the path of a infividual will be the different points where he received a call or an sms. Each individual should have a color, such that from the graph we can see it they met or not and so on.
Some components have been designed for the workbench already dont go from scratch proceed to ameliorate them and make them fully functional such as: FileUploader, NetworkGraph, FilterPanel



### 📦 Tech Stack

* **Next.js**
* `next-intl` for i18n
* `tailwindcss` for styling
* `next-themes` for theme switching
* Basic authentication logic present

---

### 🧠 Execution Instructions

Please help me progressively:

1. Review the component FileUploader to make it more robust in acepting documents 
2. Build a good NetworkGraph component that will proper ly diplay the nodes the edges with the desired requirements mentioned above using D3.js or vis.js: the most adequate one that will be capble of viewing evne 50listings at the time
3. Build the LocationGraph component
4. Make the Workbench page to be really complete and all functional
5. Ensure everything is **clean, readable, and modular.**

---

### 🧵 Github repository

This is my Github repository that is attched to the prompt
Most components have been designed already but when i upload a file athat has the required structure and sheet it fails at the validation of the sheet structure
---

I want the work on the workbech to be done progressively given that it is arduous and we test it progressively, and only when i validate a tash that we move to the next. Let me know if you need environment variables or authentication details to test logged-in logic. Also feel free to suggest packages that improve UX (e.g. Framer Motion, ShadCN UI, React Icons).

Thanks! I want this to feel like a top-tier, production-ready app — polish matters.
