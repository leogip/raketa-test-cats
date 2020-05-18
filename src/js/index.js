document.addEventListener('DOMContentLoaded', () => {
    slickyHeader()
    dropSorting()
})

function slickyHeader() {
    const header = document.querySelector('.header')
    const content = document.querySelector('.catalog')
    let stuck = false

    window.onscroll = function (e) {
        let offset = window.pageYOffset
        if (!stuck && offset > 0) {
            header.classList.add('header_state_fixed')
            content.classList.add('catalog_fixed_header')
            stuck = true
        } else if (stuck && offset == 0) {
            header.classList.remove('header_state_fixed')
            content.classList.remove('catalog_fixed_header')
            stuck = false
        }
    }
}

function dropSorting() {
    const container = document.querySelector('.sorting')
    const changed = document.querySelector('.sorting__changed')
    const items = document.querySelectorAll('.sorting__item')

    changed.addEventListener('click', toggler)
    changed.addEventListener('keyup', toggler)

    items.forEach((item) => item.addEventListener('click', changedItem))

    function toggler(e) {
        if (e.keyCode === 32 || e.type === 'click') {
            container.classList.toggle('show')
        }
    }

    function changedItem() {
        changed.innerHTML = ''

        const arrowClone = this.firstElementChild.cloneNode()
        const textClone = this.lastElementChild.cloneNode(true)

        changed.appendChild(arrowClone)
        changed.appendChild(textClone)

        container.classList.remove('show')
    }
}
