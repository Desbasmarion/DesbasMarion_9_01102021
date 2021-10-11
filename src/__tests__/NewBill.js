import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import firestore from "../app/Firestore.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"
import BillsUI from "../views/BillsUI.js"

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
//On indique que nous sommes sur le parcours Employé
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  describe("When I access NewBill Page", () => {
    test("Then the NewBill Page should be rendered", () => {
      //Création page NewBill
      document.body.innerHTML = NewBillUI()
      
      //On vérifie la présence du texte 'Envoyer une note de frais' sur la page NewBill
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
  
  describe("When I'm on NewBill Page", () => {
    describe("And I upload a image file", () => {
      test("Then file extension is not correct", () => {
        document.body.innerHTML = NewBillUI()
        //Instanciation class NewBill
        const newBill = new NewBill({
          document, onNavigate, firestore: null, localStorage: window.localStorage
        })

        //Simulation méthode de chargement d'un fichier
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
        const inputFile = screen.getByTestId("file")

        //Ecouteur d'évènement sur input de chargement de fichier
        inputFile.addEventListener("change", handleChangeFile)

        //Simulation de l'évènement avec FireEvent
        fireEvent.change(inputFile, {
            target: {
                files: [new File(["test.jpg"], "test.jpg", { type: "image/jpg" })],
            }
        })

        //Message d'erreur apparait
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
       
        //On créer une nouvelle note de frais pour pouvoir tester la méthode handleSubmit
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

        //On simule la méthode handleSubmit
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

        //On applique les valeurs de la note de frais créée aux éléments du DOM existants 
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

        //On simule le clic 
        fireEvent.click(submit)

        //On vérifie qu'à la soumission de la note de frais, la méthode handleSubmit a été appelée
        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})

// test d'intégration POST
//???????
describe("Given I am a user connected as an Employee", () => {
  describe("When I submit a new bill and return to Bill Page", () => {
    test("fetches bills from mock API POST", async () => {
       const getSpy = jest.spyOn(firebase, "post")
       const bills = await firebase.post()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


