async function setSalesStat(selectedStore = '', selectedGroup = '') {
    dataSource = './Data/DB_SUMMARY.json';
    if (dateCovered==='NOV 2024') {
        dataSource = './Data/DB_SUMMARY_NOV.json';
    } else if (dateCovered==='OCT 2024') {
        dataSource = './Data/DB_SUMMARY_OCT.json';
    } else if (dateCovered==='SEP 2024') {
        dataSource = './Data/DB_SUMMARY_SEP.json';
    }

    // Current Sale
    const nCurrAmt_ = document.getElementById('curramt_');
    const nAtv_____ = document.getElementById('atv_____');
    const nGP_Pct__ = document.getElementById('gp_pct__');
    // Prev Year Sale
    const nLastAmt_ = document.getElementById('lastamt_');
    const nIncDec_p = document.getElementById('incdec_p');
    // Last Month Sale
    const nLMontAmt = document.getElementById('lmontamt');
    const nIncDec_m = document.getElementById('incdec_m');
    // Pre Pandemic Sale
    const nLMon2Amt = document.getElementById('lmon2amt');
    const nIncDec_c = document.getElementById('incdec_c');

    try {
        const response = await fetch(dataSource);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonData = await response.json();

        let n_CurrAmt_ = 0;
        let n_CurrCos_ = 0;
        let n_ATV_____ = 0;
        let n_GP_Pct__ = 0;

        let n_LastAmt_ = 0;
        let n_IncDec_p = 0;

        let n_LMontAmt = 0;
        let n_IncDec_m = 0;

        let n_LMon2Amt = 0;
        let n_IncDec_c = 0;

        jsonData.forEach(entry => {

            if (multiStore.length > 0 && !multiStore.includes(entry.storname.trim())) {
                return; // Skip this entry if the store is not in the multiStore
            }
            // Apply filters based on selectedGroup and selectedStore
            if (selectedGroup && selectedGroup !== 'All Business Group' && entry.storgrup !== selectedGroup) {
                return; // Skip if the group doesn't match
            }
            if (selectedStore && selectedStore !== 'All Stores' && entry.storname !== selectedStore) {
                return; // Skip if the selected store doesn't match
            }
            if (entry.storgrup==="RESTO - WENDY'S" || entry.storgrup==="MTR SALES") {
                return; 
            }
    
  
            // Calculate Totals
            n_CurrAmt_ += entry.curramt_;
            n_CurrCos_ += entry.currcos_;
            n_LastAmt_ += entry.lastamt_ || 0; // Ensure it's defined
            n_LMontAmt += entry.lmontamt || 0; // Ensure it's defined
            n_LMon2Amt += entry.lmon2amt || 0; // Ensure it's defined
            
            // Ensure currtxn_ and currcos_ are defined for calculations
            if (entry.currtxn_) {
                n_ATV_____ += entry.curramt_ / entry.currtxn_;
            }

        });

        // Average ATV and GP% (assuming you're calculating averages here)
        n_ATV_____ /= jsonData.length; // Average ATV

        // Calculate Increase/Decrease percentages
        // n_IncDec_p = ((n_CurrAmt_ - n_LastAmt_) / n_LastAmt_) * 100 || 0;
        // n_IncDec_m = ((n_CurrAmt_ - n_LMontAmt) / n_LMontAmt) * 100 || 0;
        // n_IncDec_c = ((n_CurrAmt_ - n_LMon2Amt) / n_LMon2Amt) * 100 || 0;

        n_IncDec_p = n_LastAmt_ !== 0 ? ((n_CurrAmt_ - n_LastAmt_) / n_LastAmt_) * 100 : 0;
        n_IncDec_m = n_LMontAmt !== 0 ? ((n_CurrAmt_ - n_LMontAmt) / n_LMontAmt) * 100 : 0;
        n_IncDec_c = n_LMon2Amt !== 0 ? ((n_CurrAmt_ - n_LMon2Amt) / n_LMon2Amt) * 100 : 0;        

        // Calculate Gross Profit percentage
        n_GP_Pct__ = n_CurrAmt_ !== 0 ? ((n_CurrAmt_ - n_CurrCos_) / n_CurrAmt_) * 100 : 0;
        // if (n_CurrAmt_!==0) {
        //     n_GP_Pct__=((n_CurrAmt_-n_CurrCos_) / n_CurrAmt_) * 100
        // }
        // else {
        //     n_GP_Pct__=0
        // }            

        // Set the values in the labels
        nCurrAmt_.innerText = Math.floor(n_CurrAmt_).toLocaleString(); // Total curramt_
        nCurrAmt_.style.fontWeight = "bold";
        nAtv_____.innerText = n_ATV_____.toFixed();
        nGP_Pct__.innerText = n_GP_Pct__.toFixed(2) + '%';

        nLastAmt_.innerText = Math.floor(n_LastAmt_).toLocaleString(); // Total prevamt_
        nIncDec_p.innerText = n_IncDec_p.toFixed(2) + '%';
        if (n_IncDec_p < 0) {
            nIncDec_p.style.color = "red"; // Change color to red for negative values
        } else {
            nIncDec_p.style.color = "black"; // Change color back to black for positive values
        }

        nLMontAmt.innerText = Math.floor(n_LMontAmt).toLocaleString(); // Total lmontamt
        nIncDec_m.innerText = n_IncDec_m.toFixed(2) + '%';
        nIncDec_m.style.color = n_IncDec_m < 0 ? "red" : "black";

        nLMon2Amt.innerText = Math.floor(n_LMon2Amt).toLocaleString(); // Total lmon2amt
        nIncDec_c.innerText = n_IncDec_c.toFixed(2) + '%';
        nIncDec_c.style.color = n_IncDec_c < 0 ? "red" : "black";

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


