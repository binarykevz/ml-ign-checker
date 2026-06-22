const express = require('express');
const axios = require('axios');

/**
 * Core logic to check Mobile Legends IGN.
 * Can be used programmatically without Express.
 * 
 * @param {string} id - User ID
 * @param {string} zone - Server/Zone ID
 * @returns {Promise<Object>} Player data
 */
async function checkMobileLegendsIGN(id, zone) {
  if (!id) {
    const err = new Error("Bad Request: ID is required");
    err.statusCode = 400;
    throw err;
  }
  if (!zone) {
    const err = new Error("Bad Request: Server ID (zone) is required for Mobile Legends");
    err.statusCode = 400;
    throw err;
  }

  const endpoint = "https://order-sg.codashop.com/initPayment.action";
  const body = `voucherPricePoint.id=4150&voucherPricePoint.price=1579.0&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${zone}&voucherTypeName=MOBILE_LEGENDS&shopLang=id_ID&voucherTypeId=1&gvtId=1`;

  try {
    const response = await axios.post(endpoint, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const apiRes = response.data;

    if (!apiRes.success) {
      const err = new Error("Player not found. Please check your ID and Server ID (zone).");
      err.statusCode = 404;
      err.details = {
        id: apiRes.user?.userId ?? id,
        zone: apiRes.user?.zoneId ?? zone,
      };
      throw err;
    }

    return {
      success: true,
      game: apiRes.confirmationFields?.productName,
      name: apiRes.confirmationFields?.username,
      id: apiRes.user?.userId,
      zone: apiRes.user?.zoneId,
    };
  } catch (error) {
    // Re-throw our custom 400/404 errors to be handled by the router
    if (error.statusCode) throw error; 
    
    // Fallback for network/axios errors
    throw new Error("Cannot find nickname from your request.");
  }
}

/**
 * Express Router for mounting in an Express app
 */
const router = express.Router();

const checkIGNHandler = async (req, res) => {
  // Support both GET (query) and POST (body)
  const id = req.query.id || req.body?.id;
  const zone = req.query.zone || req.body?.zone;

  try {
    const data = await checkMobileLegendsIGN(id, zone);
    return res.json(data);
  } catch (error) {
    const status = error.statusCode || 500;
    const responseJson = { error: error.message };
    
    // Attach extra details if they exist (like id/zone for 404 errors)
    if (error.details) {
      responseJson.success = false;
      Object.assign(responseJson, error.details);
    }
    
    return res.status(status).json(responseJson);
  }
};

router.get('/check-ign', checkIGNHandler);
router.post('/check-ign', checkIGNHandler);

// Export both the router and the core function
module.exports = {
  checkMobileLegendsIGN,
  router,
};
