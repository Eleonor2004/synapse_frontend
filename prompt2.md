
Hi Claude!You are an expert in web development even one of the best specialized in nestjs with tailwind css and typescript and an amazinf UI/UX that has made one of the best ranked designed web pages in the world.  I'm working on a **Next.js project** with type script and tailwind css already configured, and I want your help to **seriously level up the design and polish** of my entire app. Here’s the full scope of what I need help with, progressively:

---

### 🚀 Project Context

I have already:

* Set up **internationalization (i18n)** using `next-intl` and defined the theme of colors in globals.css that have to be uded althrough the appplication
* Implemented **theme switching** (light/dark mode)
* Created **routing and pages**
* Built most components and pages and basic structure for components
* 

Now, I want you to help me:

### 🎨 **1. all components you design should be for good Entire UI/UX: focus only on the Workbench components**

I want a **professional-grade** look and feel, like on the best modern web apps.

* ⚡ **The entire web application must have a unique, modern design not look like a generated application**

  * Use **engaging layouts**, **modern fonts**, **shadow depth**, **interactive hover effects**, etc.
  * Make use of the colors i want on my site and they should be generally configured in the globals.css if there ar updates to be done there do so/ I want these two colors to be really present on my website:  #1e0546 and #8e43ff for the light and as well as the dark themes: on buttons, titles, components...
  * Introduce nice and smooth animations and transitions, components should have interestin dynamic components for user to continue having the envy to keep on scrolling on each page and especially on the home page

* 🎨 **Responsive Design**

  * Mobile, tablet and desktop optimized.
  * Adaptable grids, well-aligned spacing, and components that reflow smartly.

* 🌈 **Color Scheme**

  * Not monotonous or boring with the two colors mentionnend above actively present and configured in the globals.css.
  * Should work across both **light and dark** modes.

* ✨ **Animations and Transitions**

  * Smooth transitions between pages (e.g. `framer-motion`, CSS transitions).
  * Animated elements like buttons, cards, modals, etc.
 * Follow modern design trends (Neumorphism, Glassmorphism, Material, or Minimal — suggest what's best).

---

### 🔄 **2. Build a functional workbench**
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

1. Start by analyzing the repo and then we focus on the workbench.
2. Build the components that will makeup the workbech
3. Build a functional Workbench ans then test to ameliorate
4. Tackle each page one-by-one, to ameliorate design: Home
5. Ensure everything is **clean, readable, and modular.**

---

### 🧵 Project context

This is my project context that you should explore and it is from here that we will advancing in order not to redo things already done

---

I want the work on the workbech to be done progressively given that it is arduous and we test it progressively, and only when i validate a tash that we move to the next. Let me know if you need environment variables or authentication details to test logged-in logic. Also feel free to suggest packages that improve UX (e.g. Framer Motion, ShadCN UI, React Icons).

Thanks! I want this to feel like a top-tier, production-ready app — polish matters.
