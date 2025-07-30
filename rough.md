I have a problem with my component NetworkGraph it displays this error:No Network Data Found
Could not find valid interaction data in the 'Listing' sheet. Please ensure your file is correct and the parent component is passing the data properly.

The component looks for columns like:

• Caller: Numéro Appelant
• Recipient: Numéro appelé
• Date: Date Début appel
• Duration: Durée appel
• IMEI: IMEI numéro appelant (Optional)
• Location: Localisation numéro appelant... (Optional)

Modify the logic of this file such that it will take excel files with different sheets and the sheet Listing with the following columns:Numéro Appelant	Localisation numéro appelant (Longitude, Latitude)	IMEI numéro appelant	Date Début appel	Durée appel	Numéro appeléA1:F1
Go through the code toroughly identify all causes of errors make the code to be more robust and help me correct the error. I've been spending more then 2hours on this problem, so be minutious identify the causes of the errors and coorect them for me to have a functional component, this is the component: 
attached to my prompt i have equally added a pdf that contains exactly the tables found in each sheet of the excel file with which i am testing