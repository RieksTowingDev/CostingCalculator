const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { connectToDatabase } = require('./src/databaseConnection');
const sql = require('mssql');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'src', 'utils')));

// Connect to the database
connectToDatabase().then(() => {
    console.log('Database connected successfully');
}).catch((err) => {
    console.error('Database connection failed:', err);
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'utils', 'index.html'));
});

// Handle form submission
app.post('/submit', async (req, res) => {
    const data = req.body;

    // Perform calculations here
    const vehicle = data.Vehicles;
    const callOut = data.CallOut;
    const calloutQty = parseInt(data.Calloutqty, 10);
    const travelQty = parseInt(data.travelqty, 10);
    const labourPrepQty = parseInt(data.LabourPrepQty, 10);
    const addItems = Array.isArray(data.AddItems) ? data.AddItems : [data.AddItems];
    const addQty = parseInt(data.ADDqty, 10);
    const tollQty = parseInt(data.TollQty, 10);

    let totalCost = 0;
    let tariff = 0;

    if (vehicle === 'CarCarrier') {
        if (callOut === 'Accident') {
            tariff = 1130;
        } else if (callOut === 'Mechanical') {
            tariff = 1920;
        } else if (callOut === 'Travel') {
            tariff = 1050;
        }
    } else if (vehicle === '26Truck') {
        if (callOut === 'Accident') {
            tariff = 1510;
        } else if (callOut === 'Mechanical') {
            tariff = 2370;
        } else if (callOut === 'Travel') {
            tariff = 1280;
        }
    } else if (vehicle === '79Truck') {
        if (callOut === 'Accident') {
            tariff = 1900;
        } else if (callOut === 'Mechanical') {
            tariff = 2960;
        } else if (callOut === 'Travel') {
            tariff = 1460;
        }
    } else if (vehicle === '1015Truck') {
        if (callOut === 'Accident') {
            tariff = 2300;
        } else if (callOut === 'Mechanical') {
            tariff = 3250;
        } else if (callOut === 'Travel') {
            tariff = 1590;
        }
    } else if (vehicle === 'artic46') {
        if (callOut === 'Accident') {
            tariff = 2490;
        } else if (callOut === 'Mechanical') {
            tariff = 4040;
        } else if (callOut === 'Travel') {
            tariff = 1890;
        }
    } else if (vehicle === 'artic78') {
        if (callOut === 'Accident') {
            tariff = 2570;
        } else if (callOut === 'Mechanical') {
            tariff = 4420;
        } else if (callOut === 'Travel') {
            tariff = 2030;
        }
    } else if (vehicle === 'artic9') {
        if (callOut === 'Accident') {
            tariff = 3100;
        } else if (callOut === 'Mechanical') {
            tariff = 4860;
        } else if (callOut === 'Travel') {
            tariff = 2230;
        }
    } else if (vehicle === 'SingleBus') {
        if (callOut === 'Accident') {
            tariff = 2440;
        } else if (callOut === 'Mechanical') {
            tariff = 3700;
        } else if (callOut === 'Travel') {
            tariff = 1720;
        }
    } else if (vehicle === 'DoubleBus') {
        if (callOut === 'Accident') {
            tariff = 2490;
        } else if (callOut === 'Mechanical') {
            tariff = 4040;
        } else if (callOut === 'Travel') {
            tariff = 1890;
        }
    }

    //totalCost += calloutQty * tariff;
    //totalCost += travelQty * 15; // Assuming R15 per km travelled
    //totalCost += labourPrepQty * 20; // Assuming R20 per labour prep
    //addItems.forEach(item => {
    //    const itemTariff = parseInt(data[`AddItemsTariff_${item}`], 10);
    //    totalCost += addQty * itemTariff;
    //});
    //totalCost += tollQty * 7; // Assuming R7 per toll

    console.log('Total Cost:', totalCost);

    try {
        const pool = await sql.connect();
        const request = pool.request();
        request.input('Vehicle', sql.VarChar, vehicle);
        request.input('CallOut', sql.VarChar, callOut);
        request.input('Calloutqty', sql.Int, calloutQty);
        request.input('travelqty', sql.Int, travelQty);
        request.input('LabourPrepQty', sql.Int, labourPrepQty);
        request.input('ADDqty', sql.Int, addQty);
        request.input('TollQty', sql.Int, tollQty);
        request.input('AddItems', sql.VarChar, addItems.join(','));
        request.input('TotalCost', sql.Float, totalCost);

        await request.query(`
            INSERT INTO Costing (Vehicle, CallOut, Calloutqty, travelqty, LabourPrepQty, ADDqty, TollQty, AddItems, TotalCost)
            VALUES (@Vehicle, @CallOut, @calloutQty, @travelQty, @LabourPrepQty, @ADDqty, @TollQty, @AddItems, @TotalCost)
        `);

        res.json({ message: 'Data saved successfully', totalCost, tariff });
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});