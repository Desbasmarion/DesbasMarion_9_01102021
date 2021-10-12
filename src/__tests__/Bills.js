import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import firebase from "../__mocks__/firebase"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import userEvent from '@testing-library/user-event'
import Firestore from "../app/Firestore";
import { ROUTES } from "../constants/routes"

//Pour pourvoir tester les éléments du DOM 
import '@testing-library/jest-dom'
 
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe('Given I try to connect on app as an Employee', () => {
  describe('When I am on Login Page', () => {
    test('Then it should render LoadingPage', () => {
      //On affiche la page loading en faisant passer la condition loading de la page BillsUI à true
    const html = BillsUI({loading : true})
    document.body.innerHTML = html
    //On vérifie la présence du mot 'Loading...' sur la page
    expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    //On test l'autre condition > la page erreur
    test('Then it should render ErrorPage', () => {
      const html = BillsUI({error : true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})

//test d'intégration pour page Bills.js
describe('Given I am connected as Employee and I am on Bill page', () => {
  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      //On indique que l'on se trouve sur la page Employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      //On affiche la page Bill en récupérant les data liés aux notes de frais
      const html = BillsUI({data : bills})
      document.body.innerHTML = html

      //Si l'utilisateur navigue sur la page qui contient Bills dans son URL, alors c'est BillsUI qui est affichée
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      //On instancie la class Bills
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })

      //On simule la fonction modal > création d'une modale (dans BillsUI)
      $.fn.modal = jest.fn()

      //On simule la méthode handleClickIconEye 
      const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(eye[0]))  

      //On simule l'évènement du clic avec fireEvent
      const eye = screen.getAllByTestId("icon-eye")
      eye[0].addEventListener('click', handleClickIconEye)
      fireEvent.click(eye[0])

      //On vérifie que la fonction handleClickIconEye soit bien appelée
      expect(handleClickIconEye).toHaveBeenCalled()

      //On vérifie l'ouverture de la modale pour visualiser le justificatif
      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })
  })

  describe('When I click on "nouvelle note de frais"', () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({data : bills})
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      const bill = new Bills({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })
    
      //On simule la méthode handleClickNewBill
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill)  

      //On simule le clic sur l'icone avec fireEvent
      const iconNewBill = screen.getByTestId("btn-new-bill")
      iconNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(iconNewBill)

      //On vérifie que la fonction handleClickIconEye soit bien appelée
      expect(handleClickNewBill).toHaveBeenCalled()

      //On vérifie l'ouverture de la modale NewBill
      const modale = screen.getByTestId('form-new-bill')
      expect(modale).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})