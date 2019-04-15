var mysql = require("mysql");
var inquirer = require("inquirer");
const chalk = require('chalk');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

//connecting to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  console.log("server connected");
  start();
});

function start() { //displays table and prompts customer
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "choice",
        type: "rawlist",
        choices: function () {
          var options = [];
          for (var i = 0; i < results.length; i++) {
            options.push(results[i].product_name);
          }
          return options;
        },
        message: "What item do you want to purchase? (Type the number to the left of the item to select it.)"
      },
      {
        name: "amount",
        type: "input",
        message: "How many of this item would you like to purchase?"
      }
    ])
      .then(function (answer) {
        var selectedItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            selectedItem = results[i];
            // console.log(results);

          }
        }
        if (selectedItem.stock_quantity < parseInt(answer.amount)) {
          console.log(chalk.bold.inverse.bgBlue("We only have" + " " + selectedItem.stock_quantity + " " + "in stock. Pleae select a smaller quantity or another item."));
          start();
        }
        else {

          connection.query(
            "UPDATE products SET stock_quantity = ? WHERE id = ?",
            [
              selectedItem.stock_quantity - answer.amount, selectedItem.id

            ],
            function (err) {
              if (err) throw err;
              customerTotal = selectedItem.price * parseInt(answer.amount);
              console.log(chalk.bold.inverse.bgBlue("Your Item is in stock! Your total is $" + customerTotal + "."));
              inquirer
                .prompt({
                  name: "anotherPurchase",
                  type: "rawlist",
                  message: "Would you like to make another purchase?",
                  choices: ["YES", "NO"]
                })
                .then(function (answer) {
                  if (answer.anotherPurchase.toUpperCase() === "YES") {
                    start();
                  }
                  else {
                    console.log(chalk.bold.inverse.bgBlue("Thank you for shopping with us, Have a great day!"))
                    setTimeout(function() { connection.end() }, 3000)
                  }

                });
            }
          )
        }
      });
  })
};