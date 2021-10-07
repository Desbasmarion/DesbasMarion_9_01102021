import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import firestore from "../app/Firestore.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  describe("When I access NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
  describe("When I'm on NewBill Page", () => {
    describe("And I upload a image file", () => {
      test("Then accepted file appears", () => {
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({
          document, onNavigate, firestore: null, localStorage: window.localStorage
        })
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
        const inputFile = screen.getByTestId("file")
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
            target: {
                files: [new File(["test.jpg"], "test.jpg", { type: "image/jpg" })],
            }
        })
        const error = screen.getByTestId('errorMessage')
        expect(error).toBeFalsy
      })
    })
    
    describe("And I submit a valid bill form", () => {
      test('then a bill is created', async () => {
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({
          document, onNavigate, firestore: null, localStorage: window.localStorage
        })          
       
        const submit = screen.getByTestId('form-new-bill')
        const billTest = {
          name: "billTest",
          date: "2021-10-07",
          type: "restaurant",
          amount: 1,
          pct: 1,
          vat: 1,
          commentary: "ceci est un commentaire test",
          fileName: "test",
          fileUrl: "test.jpg"
        }
        
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        newBill.createBill = (newBill) => newBill
        document.querySelector(`input[data-testid="expense-name"]`).value = billTest.name
        document.querySelector(`input[data-testid="datepicker"]`).value = billTest.date
        document.querySelector(`select[data-testid="expense-type"]`).value = billTest.type
        document.querySelector(`input[data-testid="amount"]`).value = billTest.amount
        document.querySelector(`input[data-testid="vat"]`).value = billTest.vat
        document.querySelector(`input[data-testid="pct"]`).value = billTest.pct
        document.querySelector(`textarea[data-testid="commentary"]`).value = billTest.commentary
        newBill.fileUrl = billTest.fileUrl
        newBill.fileName = billTest.fileName 
        
        submit.addEventListener('click', handleSubmit)
        fireEvent.click(submit)
        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
    
})
