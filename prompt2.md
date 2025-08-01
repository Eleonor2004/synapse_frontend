
Hi Claude!You are an expert in web development even one of the best specialized in nestjs with tailwind css and typescript and an amazinf UI/UX that has made one of the best ranked designed web pages in the world.  I'm working on a **Next.js project** with type script and tailwind css already configured, and I want your help me make function properly the core page of my application: a functional workbench to view interactions between individuals from their listings and location graph. Here’s the full scope of what I need help with, progressively:

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
Now it is already rendering but i am not satisfied with that. I want the workbench to be be well designed and do all the task to be done, with responsive.we will use libairies such as vis.js, D3.js for the grapphs.  It is the core of our application. So it should be really well done:
 * We should import excel files with extension .xlsx, or extract those files from a zip or from a folder. and verify that this excel file has the following sheets within it: "Abonné", "Listing", "Fréquence par cellule", "Fréquence Correspondant", "Fréquence par Durée appel", "Fréquence par IMEI", "Identification des abonnés", which we already do in our present version
 * After the import a message will be displayed about the import if it failed, or if it was successful, so you will create a component for that that will display that message at the top right of screen and will be used althrouh the app, the color used should be indicative of the type of message: warning, info, success, failure ...
 * Next we will display two main graphs by exploiting the infos obtained from the different sheets, the aim of this app is to be able to visualize the interactions of an individual with people based on his listing so the interactions are seen in the sheet "Listing", an individual is identified by his number: so on the graph the nodes will be the individuals and the edges will be the interactions they had: SMS or call
 * Besides that we should be able to get informations about an individual by clicking on a node that will display those infos about the individual in a little node just like in Google Maps for places
 * The level of interaction of individuals should be seen from the color of their edges in progressive range: from green, yellow, orange, to red increeasingly also the size of the node should be obtained from the lelvel of interactions the indidual has
 * We should also have components for filter(based on interaction through SMS, phone calls, period of interaction, Interactions with one or more individuals identified by their IMEI or phone number) and search
 * The second graph should display the different localization of people through the day on a localization graph from Google Maps or Open street maps such that the path of a infividual will be the different points where he received a call or an sms. Each individual should have a color, such that from the graph we can see it they met or not and so on.
This work was already very well done in the first version of my work that i will provide below but the it was 100% client side and it was even really faster. So I wnat you to go through the code i will provide and make such that the Network Graph and the locationGraph should be just as in that fist version and we should be able to see the infos of a node, the size of a node proportional to its numbers of interactions and it should not be too cumbersome. Do it well and then we will implement the filters


### 📦 Tech Stack

* **Next.js**
* `next-intl` for i18n
* `tailwindcss` for styling
* `next-themes` for theme switching
* Basic authentication logic present

---

### 🧠 Execution Instructions
I am working with  React components called NetworkGraph and LocationGraph that displays interactions between individuals based on Excel file input. Currently, I encounter this error:

"No Location Data Found
Could not find valid location data in the file. Please ensure the file contains the necessary columns.

The component requires columns for:

• Caller Number (e.g., Numéro Appelant)
• Location (e.g., Localisation numéro appelant (Longitude, Latitude))
• Date (e.g., Date Début appel)" for the LocationGraph and this for the NetworkGraph : "No Network Data Found
Could not find valid interaction data in the provided file. The component tried to process the data but couldn't identify valid caller-recipient pairs.

Debug Information:

No valid nodes created. Processed: 0, Skipped: 127. Row 1: Missing caller (null) or recipient (null); Row 2: Missing caller (null) or recipient (null); Row 3: Missing caller (null) or recipient (null); Row 4: Missing caller (null) or recipient (null); Row 5: Missing caller (null) or recipient (null)

Expected data structure:

• Caller Number (e.g., "Numéro Appelant", "650589893")
• Recipient Number (e.g., "Numéro appelé", "659789768")
• Call Date (e.g., "Date Début appel")
• Duration/Type (e.g., "Durée appel", "SMS")
• IMEI (Optional)
• Location (Optional)
The component expects a sheet named "Listing" with the following columns:

Numéro Appelant
Localisation numéro appelant (Longitude, Latitude)
IMEI numéro appelant (optional)
Date Début appel
Durée appel
Numéro appelé
Range: A1:F1"

The component expects a sheet named "Listing" with the following columns:

Numéro Appelant

Localisation numéro appelant (Longitude, Latitude)

IMEI numéro appelant (optional)

Date Début appel

Durée appel

Numéro appelé

Range: A1:F1

Please thoroughly analyze the code I provide and perform the following:

Identify all possible causes of the "No Network Data Found" error (such as issues in parsing, sheet structure, case sensitivity, data format mismatches, etc.).

Modify the logic of the component to:

Support dynamic or differently structured Excel sheets, as long as the essential columns mentioned above are present.

Be more robust, tolerant to slight variations in headers, and resilient to common data inconsistencies (e.g. extra spaces, missing optional fields).

Correct any bugs and enhance the logic so that the component correctly parses, processes, and visualizes the data from the Excel sheet.

Return to me the fully corrected and working components code that I can copy and use directly.

I have already spent more than two hours trying to fix this, so please be meticulous and detailed in your corrections. Here is the full code
Please help me progressively:

1. Review the components NetworkGraph and LocationGraph such that it is really functional and add it to Workbench page, I have already spent a whole day trying to make it function so please i really need you ti focus, examine the code meticulously and do proper corrections for it to work
2. Develop the accessory components such as FilterPanel and NodeInformations to make this workbench really complete and add them to the workbech page, and amelioration the Notification component
3. Make the Workbench page to be really complete and all functional
4. Ensure everything is **clean, readable, and modular.**

---

### 🧵 Github repository

This is my Github repository that is attched to the prompt
Most components have been designed already but when i upload a file athat has the required structure and sheet it fails at the validation of the sheet structure
---

I want the work on the workbech to be done progressively given that it is arduous and we test it progressively, and only when i validate a tash that we move to the next. Also feel free to suggest packages that improve UX (e.g. Framer Motion, ShadCN UI, React Icons).
I equally attached a pdf that contains the tables: each table representing the data of one sheet of the excel file i am using to test the application


Thanks! I want this to feel like a top-tier, production-ready app — polish matters.
